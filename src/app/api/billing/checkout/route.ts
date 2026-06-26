import type { NextRequest } from 'next/server'
import { Plan } from '@prisma/client'
import stripe, { PLAN_TO_PRICE } from '@/lib/stripe'
import { syncUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await syncUser()
  const { plan } = (await req.json()) as { plan: Plan }

  const priceId = PLAN_TO_PRICE[plan]
  if (!priceId) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const baseUrl = process.env.KINDE_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    ...(user.stripeCustomerId
      ? { customer: user.stripeCustomerId }
      : { customer_email: user.email }),
    success_url: `${baseUrl}/settings/billing?success=1`,
    cancel_url: `${baseUrl}/settings/billing`,
    metadata: { userId: user.id },
  })

  return Response.json({ url: session.url })
}
