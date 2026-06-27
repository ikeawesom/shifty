import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PLAN_ASSIGNEE_LIMITS } from '@/lib/plans'
import { OrgRole, Recurrence } from '@prisma/client'

type Params = Promise<{ id: string }>

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const user = await syncUser()

  const shift = await prisma.shift.findUnique({
    where: { id },
    include: { assignees: { include: { member: { include: { user: true } } } } },
  })

  if (!shift) return Response.json({ error: 'Not found' }, { status: 404 })

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: shift.orgId } },
  })

  if (!membership) return Response.json({ error: 'Forbidden' }, { status: 403 })

  return Response.json(shift)
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const user = await syncUser()

  const shift = await prisma.shift.findUnique({ where: { id } })
  if (!shift) return Response.json({ error: 'Not found' }, { status: 404 })

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: shift.orgId } },
  })

  if (!membership || membership.role !== OrgRole.ADMIN) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as {
    title?: string
    description?: string | null
    startsAt?: string
    endsAt?: string | null
    recurrence?: Recurrence
    assigneeIds?: string[]
  }

  if (body.assigneeIds !== undefined) {
    const limit = PLAN_ASSIGNEE_LIMITS[user.plan]
    if (body.assigneeIds.length > limit) {
      return Response.json(
        { error: `Your ${user.plan} plan allows at most ${limit} assignee${limit === 1 ? '' : 's'} per shift` },
        { status: 403 },
      )
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (body.assigneeIds !== undefined) {
      await tx.shiftAssignee.deleteMany({ where: { shiftId: id } })
      await tx.shiftAssignee.createMany({
        data: body.assigneeIds.map((memberId) => ({ shiftId: id, memberId })),
      })
    }

    return tx.shift.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.startsAt !== undefined && { startsAt: new Date(body.startsAt) }),
        ...(body.endsAt !== undefined && { endsAt: body.endsAt ? new Date(body.endsAt) : null }),
        ...(body.recurrence !== undefined && { recurrence: body.recurrence }),
      },
      include: { assignees: true },
    })
  })

  return Response.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const user = await syncUser()

  const shift = await prisma.shift.findUnique({ where: { id } })
  if (!shift) return Response.json({ error: 'Not found' }, { status: 404 })

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: shift.orgId } },
  })

  if (!membership || membership.role !== OrgRole.ADMIN) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.$transaction([
    prisma.shiftAssignee.deleteMany({ where: { shiftId: id } }),
    prisma.shiftCompletion.deleteMany({ where: { shiftId: id } }),
    prisma.shift.delete({ where: { id } }),
  ])

  return new Response(null, { status: 204 })
}
