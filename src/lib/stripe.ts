import Stripe from 'stripe'
import { Plan } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLAN_TO_PRICE: Partial<Record<Plan, string>> = {
  [Plan.STARTER]: process.env.STRIPE_PRICE_STARTER!,
  [Plan.PRO]: process.env.STRIPE_PRICE_PRO!,
  [Plan.ENTERPRISE]: process.env.STRIPE_PRICE_ENTERPRISE!,
}

export const PRICE_TO_PLAN: Record<string, Plan> = Object.fromEntries(
  Object.entries(PLAN_TO_PRICE)
    .filter(([, price]) => price)
    .map(([plan, price]) => [price, plan as Plan])
)

export default stripe
