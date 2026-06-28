import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import type { OrgMember, Organization } from '@prisma/client'

export const ACTIVE_ORG_COOKIE = 'shifty-active-org'

export type ActiveOrg = OrgMember & { org: Organization }

export async function getActiveOrg(userId: string): Promise<ActiveOrg | null> {
  const cookieStore = await cookies()
  const storedOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value

  if (storedOrgId) {
    const m = await prisma.orgMember.findUnique({
      where: { userId_orgId: { userId, orgId: storedOrgId } },
      include: { org: true },
    })
    if (m) return m
  }

  return prisma.orgMember.findFirst({
    where: { userId },
    include: { org: true },
    orderBy: { joinedAt: 'asc' },
  })
}
