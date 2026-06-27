import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PLAN_ASSIGNEE_LIMITS } from '@/lib/plans'
import { OrgRole, Recurrence } from '@prisma/client'

interface CreateShiftBody {
  orgId: string
  title: string
  description?: string
  startsAt: string
  endsAt?: string
  recurrence?: Recurrence
  assigneeIds: string[]
}

export async function POST(req: NextRequest) {
  const user = await syncUser()
  const body = (await req.json()) as CreateShiftBody
  const { orgId, title, description, startsAt, endsAt, recurrence, assigneeIds } = body

  if (!orgId || !title || !startsAt || !assigneeIds) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  })

  if (!membership || membership.role !== OrgRole.ADMIN) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const limit = PLAN_ASSIGNEE_LIMITS[user.plan]
  if (assigneeIds.length > limit) {
    return Response.json(
      { error: `Your ${user.plan} plan allows at most ${limit} assignee${limit === 1 ? '' : 's'} per shift` },
      { status: 403 },
    )
  }

  const shift = await prisma.shift.create({
    data: {
      orgId,
      title,
      description: description ?? null,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      recurrence: recurrence ?? Recurrence.ONE_OFF,
      createdById: user.id,
      assignees: {
        create: assigneeIds.map((memberId) => ({ memberId })),
      },
    },
    include: { assignees: true },
  })

  return Response.json(shift, { status: 201 })
}
