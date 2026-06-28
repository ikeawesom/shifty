import { Plan, ReminderType } from '@prisma/client'

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

export const PLAN_ORG_LIMITS: Record<Plan, number> = {
  FREE: 1,
  STARTER: 3,
  PRO: 8,
  ENTERPRISE: Infinity,
}

export const PLAN_ALLOWED_REMINDER_TYPES: Record<Plan, ReminderType[]> = {
  FREE: [],
  STARTER: [ReminderType.ALL_DAILY_SUMMARY],
  PRO: [ReminderType.ALL_DAILY_SUMMARY, ReminderType.ASSIGNEE_DAILY_SUMMARY, ReminderType.ASSIGNEE_OWN_SHIFT],
  ENTERPRISE: [
    ReminderType.ALL_DAILY_SUMMARY,
    ReminderType.ASSIGNEE_DAILY_SUMMARY,
    ReminderType.ASSIGNEE_OWN_SHIFT,
    ReminderType.ASSIGNEE_PRE_SHIFT,
  ],
}
