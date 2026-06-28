import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await syncUser()
  const activeOrg = await getActiveOrg(user.id)
  if (!activeOrg) return Response.json({ error: 'No active organisation' }, { status: 400 })
  const { displayName } = (await req.json()) as { displayName?: string }
  await prisma.orgMember.update({
    where: { userId_orgId: { userId: user.id, orgId: activeOrg.orgId } },
    data: { displayName: displayName?.trim() || null },
  })
  return Response.json({ ok: true })
}
