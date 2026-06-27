import { Plan } from '@prisma/client'

export const PLAN_MEMBER_LIMITS: Record<Plan, number> = {
  FREE: 10,
  STARTER: 20,
  PRO: 50,
  ENTERPRISE: Infinity,
}

export const PLAN_ASSIGNEE_LIMITS: Record<Plan, number> = {
  FREE: 1,
  STARTER: 5,
  PRO: 10,
  ENTERPRISE: Infinity,
}
