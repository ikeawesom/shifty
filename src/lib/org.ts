import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import type { OrgMember, Organization } from '@prisma/client'
import { NameMode } from '@prisma/client'

export { NameMode }

export const ACTIVE_ORG_COOKIE = 'shifty-active-org'

export type ActiveOrg = OrgMember & { org: Organization }

export function resolveMemberName(
  member: { displayName: string | null; user: { name: string | null; email: string } },
  nameMode: NameMode,
): string {
  if (nameMode === NameMode.DISPLAY_NAME) return member.displayName ?? member.user.name ?? member.user.email
  return member.user.name ?? member.user.email
}

export function censorEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain || local.length <= 2) return email
  return `${local[0]}****${local[local.length - 1]}@${domain}`
}

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
