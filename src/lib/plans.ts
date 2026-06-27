import { Plan } from '@prisma/client'

export const PLAN_MEMBER_LIMITS: Record<Plan, number> = {
  FREE: 10,
  STARTER: 20,
  PRO: 50,
  ENTERPRISE: Infinity,
}
