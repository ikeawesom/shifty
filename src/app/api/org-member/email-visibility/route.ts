import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await syncUser()
  const activeOrg = await getActiveOrg(user.id)
  if (!activeOrg) return Response.json({ error: 'No active organisation' }, { status: 400 })
  const { showEmail } = (await req.json()) as { showEmail?: boolean }
  if (typeof showEmail !== 'boolean') {
    return Response.json({ error: 'showEmail must be a boolean' }, { status: 400 })
  }
  await prisma.orgMember.update({
    where: { userId_orgId: { userId: user.id, orgId: activeOrg.orgId } },
    data: { showEmail },
  })
  return Response.json({ ok: true })
}
