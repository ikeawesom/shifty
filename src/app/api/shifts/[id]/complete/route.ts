import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrgRole } from '@prisma/client'

type Params = Promise<{ id: string }>

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const user = await syncUser()

  const shift = await prisma.shift.findUnique({ where: { id } })
  if (!shift) return Response.json({ error: 'Not found' }, { status: 404 })

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: shift.orgId } },
  })

  if (!membership) return Response.json({ error: 'Forbidden' }, { status: 403 })

  if (membership.role !== OrgRole.ADMIN) {
    const assigned = await prisma.shiftAssignee.findFirst({
      where: { shiftId: id, memberId: membership.id },
    })
    if (!assigned) return Response.json({ error: 'Not assigned to this shift' }, { status: 403 })
  }

  const existing = await prisma.shiftCompletion.findFirst({
    where: { shiftId: id, completedById: membership.id, revertedAt: null },
  })

  if (existing) return Response.json({ error: 'Already completed' }, { status: 409 })

  const body = (await req.json().catch(() => ({}))) as { notes?: string }

  const completion = await prisma.shiftCompletion.create({
    data: {
      shiftId: id,
      completedById: membership.id,
      notes: body.notes ?? null,
    },
  })

  return Response.json(completion, { status: 201 })
}
