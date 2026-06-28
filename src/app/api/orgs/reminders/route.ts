import { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ReminderType } from '@prisma/client'
import { PLAN_ALLOWED_REMINDER_TYPES } from '@/lib/plans'
import { getActiveOrg } from '@/lib/org'

const VALID_REMINDER_TYPES = new Set<string>(Object.values(ReminderType))

export async function PATCH(req: NextRequest) {
  const user = await syncUser()
  const activeOrg = await getActiveOrg(user.id)

  if (!activeOrg) {
    return Response.json({ error: 'No active organisation' }, { status: 400 })
  }

  if (activeOrg.org.ownerId !== user.id) {
    return Response.json({ error: 'Only the org owner can configure reminders' }, { status: 403 })
  }

  const body = (await req.json()) as {
    reminderType?: string
    reminderHourUtc?: number
    reminderLeadMinutes?: number
  }

  const { reminderType, reminderHourUtc, reminderLeadMinutes } = body

  if (!reminderType || !VALID_REMINDER_TYPES.has(reminderType)) {
    return Response.json({ error: 'Invalid reminder type' }, { status: 400 })
  }

  const type = reminderType as ReminderType

  if (type !== ReminderType.NONE) {
    const allowed = PLAN_ALLOWED_REMINDER_TYPES[user.plan]
    if (!allowed.includes(type)) {
      return Response.json(
        { error: `${type} reminders are not available on your ${user.plan} plan` },
        { status: 403 }
      )
    }
  }

  if (reminderHourUtc !== undefined) {
    if (!Number.isInteger(reminderHourUtc) || reminderHourUtc < 0 || reminderHourUtc > 23) {
      return Response.json({ error: 'reminderHourUtc must be an integer between 0 and 23' }, { status: 400 })
    }
  }

  if (reminderLeadMinutes !== undefined) {
    if (!Number.isInteger(reminderLeadMinutes) || reminderLeadMinutes < 5) {
      return Response.json({ error: 'reminderLeadMinutes must be an integer of at least 5' }, { status: 400 })
    }
  }

  const org = await prisma.organization.update({
    where: { id: activeOrg.orgId },
    data: {
      reminderType: type,
      ...(reminderHourUtc !== undefined && { reminderHourUtc }),
      ...(reminderLeadMinutes !== undefined && { reminderLeadMinutes }),
    },
    select: {
      id: true,
      reminderType: true,
      reminderHourUtc: true,
      reminderLeadMinutes: true,
    },
  })

  return Response.json(org)
}
