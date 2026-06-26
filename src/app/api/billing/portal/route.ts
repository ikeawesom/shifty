import type { NextRequest } from 'next/server'
import stripe from '@/lib/stripe'
import { syncUser } from '@/lib/auth'

export async function POST(_req: NextRequest) {
  const user = await syncUser()

  if (!user.stripeCustomerId) {
    return Response.json({ error: 'No billing account' }, { status: 400 })
  }

  const baseUrl = process.env.KINDE_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/settings/billing`,
  })

  return Response.json({ url: session.url })
}
