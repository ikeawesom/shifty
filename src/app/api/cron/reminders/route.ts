import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { ReminderType } from '@prisma/client'
import { PLAN_ALLOWED_REMINDER_TYPES } from '@/lib/plans'
import {
  sendDailySummaryEmail,
  sendPersonalShiftSummaryEmail,
  sendPreShiftReminderEmail,
} from '@/lib/email'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const currentHourUtc = now.getUTCHours()

  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const orgs = await prisma.organization.findMany({
    where: { reminderType: { not: ReminderType.NONE } },
    include: {
      owner: true,
      members: { include: { user: true } },
    },
  })

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const org of orgs) {
    try {
      const { reminderType, reminderHourUtc, reminderLeadMinutes, owner } = org

      const allowed = PLAN_ALLOWED_REMINDER_TYPES[owner.plan]
      if (!allowed.includes(reminderType)) {
        skipped++
        continue
      }

      if (reminderType === ReminderType.ASSIGNEE_PRE_SHIFT) {
        const windowStart = new Date(now.getTime() + reminderLeadMinutes * 60 * 1000)
        const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000)

        const shifts = await prisma.shift.findMany({
          where: { orgId: org.id, startsAt: { gte: windowStart, lt: windowEnd } },
          include: { assignees: true },
        })

        const memberMap = new Map(org.members.map((m) => [m.id, { email: m.user.email, userId: m.userId }]))

        for (const shift of shifts) {
          for (const assignee of shift.assignees) {
            const memberInfo = memberMap.get(assignee.memberId)
            if (!memberInfo) continue
            try {
              await sendPreShiftReminderEmail({
                to: memberInfo.email,
                orgName: org.name,
                shiftTitle: shift.title,
                startsAt: shift.startsAt,
              })
              sent++
              await prisma.notification.create({
                data: {
                  userId: memberInfo.userId,
                  type: 'REMINDER_SENT',
                  title: 'Reminder sent',
                  body: `A pre-shift reminder was sent for ${shift.title} at ${org.name}.`,
                },
              }).catch(() => {})
            } catch (err) {
              console.error(`Pre-shift email error for shift ${shift.id}:`, err)
              errors++
            }
          }
        }
      } else {
        if (currentHourUtc !== reminderHourUtc) {
          skipped++
          continue
        }

        const todayShifts = await prisma.shift.findMany({
          where: { orgId: org.id, startsAt: { gte: todayStart, lt: tomorrowStart } },
          include: { assignees: { include: { member: true } } },
          orderBy: { startsAt: 'asc' },
        })

        if (todayShifts.length === 0) {
          skipped++
          continue
        }

        const allShiftData = todayShifts.map((s) => ({
          title: s.title,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
        }))

        if (reminderType === ReminderType.ALL_DAILY_SUMMARY) {
          for (const member of org.members) {
            try {
              await sendDailySummaryEmail({ to: member.user.email, orgName: org.name, shifts: allShiftData })
              sent++
              await prisma.notification.create({
                data: {
                  userId: member.userId,
                  type: 'REMINDER_SENT',
                  title: 'Reminder sent',
                  body: `A shift reminder was sent to you for ${org.name}.`,
                },
              }).catch(() => {})
            } catch (err) {
              console.error(`Daily summary email error for member ${member.id}:`, err)
              errors++
            }
          }
        } else if (reminderType === ReminderType.ASSIGNEE_DAILY_SUMMARY) {
          const assigneeUserIds = new Set(
            todayShifts.flatMap((s) => s.assignees.map((a) => a.member.userId))
          )
          const recipients = org.members.filter((m) => assigneeUserIds.has(m.userId))
          for (const member of recipients) {
            try {
              await sendDailySummaryEmail({ to: member.user.email, orgName: org.name, shifts: allShiftData })
              sent++
              await prisma.notification.create({
                data: {
                  userId: member.userId,
                  type: 'REMINDER_SENT',
                  title: 'Reminder sent',
                  body: `A shift reminder was sent to you for ${org.name}.`,
                },
              }).catch(() => {})
            } catch (err) {
              console.error(`Assignee daily summary error for member ${member.id}:`, err)
              errors++
            }
          }
        } else if (reminderType === ReminderType.ASSIGNEE_OWN_SHIFT) {
          for (const member of org.members) {
            const myShifts = todayShifts.filter((s) =>
              s.assignees.some((a) => a.member.userId === member.userId)
            )
            if (myShifts.length === 0) continue
            try {
              await sendPersonalShiftSummaryEmail({
                to: member.user.email,
                orgName: org.name,
                shifts: myShifts.map((s) => ({ title: s.title, startsAt: s.startsAt, endsAt: s.endsAt })),
              })
              sent++
              await prisma.notification.create({
                data: {
                  userId: member.userId,
                  type: 'REMINDER_SENT',
                  title: 'Reminder sent',
                  body: `A shift reminder was sent to you for ${org.name}.`,
                },
              }).catch(() => {})
            } catch (err) {
              console.error(`Personal shift summary error for member ${member.id}:`, err)
              errors++
            }
          }
        }
      }
    } catch (err) {
      console.error(`Reminder run error for org ${org.id}:`, err)
      errors++
    }
  }

  return Response.json({ sent, skipped, errors, orgsProcessed: orgs.length })
}
