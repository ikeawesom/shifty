import type { NextRequest } from 'next/server'
import type Stripe from 'stripe'
import stripe, { PRICE_TO_PLAN } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { Plan } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return new Response('Missing stripe-signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new Response(`Webhook error: ${err}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = subscription.items.data[0].price.id
      const plan = PRICE_TO_PLAN[priceId] ?? Plan.FREE

      await prisma.user.update({
        where: { id: session.metadata!.userId },
        data: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          plan,
        },
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0].price.id
      const plan = PRICE_TO_PLAN[priceId] ?? Plan.FREE

      await prisma.user.update({
        where: { stripeSubscriptionId: sub.id },
        data: { plan },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await prisma.user.update({
        where: { stripeSubscriptionId: sub.id },
        data: { plan: Plan.FREE, stripeSubscriptionId: null },
      })
      break
    }
  }

  return new Response('OK', { status: 200 })
}
