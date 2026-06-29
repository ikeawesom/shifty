import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrgRole } from '@prisma/client'

type Params = Promise<{ id: string; completionId: string }>

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { id, completionId } = await params
  const user = await syncUser()

  const shift = await prisma.shift.findUnique({ where: { id } })
  if (!shift) return Response.json({ error: 'Not found' }, { status: 404 })

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: shift.orgId } },
  })

  if (!membership || membership.role !== OrgRole.ADMIN) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const completion = await prisma.shiftCompletion.findUnique({
    where: { id: completionId },
  })

  if (!completion || completion.shiftId !== id) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (completion.revertedAt !== null) {
    return Response.json({ error: 'Already reverted' }, { status: 409 })
  }

  const updated = await prisma.shiftCompletion.update({
    where: { id: completionId },
    data: { revertedAt: new Date(), revertedById: membership.id },
  })

  return Response.json(updated)
}
