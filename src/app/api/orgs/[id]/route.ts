import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { ACTIVE_ORG_COOKIE } from '@/lib/org'
import { NameMode } from '@prisma/client'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const user = await syncUser()
  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org || org.ownerId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = (await req.json()) as { name?: string; nameMode?: NameMode }

  if (body.nameMode !== undefined) {
    if (!Object.values(NameMode).includes(body.nameMode)) {
      return Response.json({ error: 'Invalid nameMode' }, { status: 400 })
    }
    const updated = await prisma.organization.update({
      where: { id },
      data: { nameMode: body.nameMode },
    })
    return Response.json(updated)
  }

  if (!body.name?.trim()) {
    return Response.json({ error: 'Name required' }, { status: 400 })
  }
  const updated = await prisma.organization.update({
    where: { id },
    data: { name: body.name.trim() },
  })
  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const user = await syncUser()
  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org || org.ownerId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  await prisma.organization.delete({ where: { id } })
  const cookieStore = await cookies()
  cookieStore.delete(ACTIVE_ORG_COOKIE)
  return Response.json({ ok: true })
}
