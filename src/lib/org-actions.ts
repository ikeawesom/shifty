'use server'

import { cookies } from 'next/headers'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ACTIVE_ORG_COOKIE } from '@/lib/org'

export async function switchOrg(orgId: string) {
  const user = await syncUser()
  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  })
  if (!membership) throw new Error('Not a member of that organisation')
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}
