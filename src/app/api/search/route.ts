import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import prisma from '@/lib/prisma'
import { OrgRole } from '@prisma/client'

export async function GET(request: Request) {
  const user = await syncUser()
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return Response.json({ shifts: [], members: [] })

  const activeOrg = await getActiveOrg(user.id)
  if (!activeOrg) return Response.json({ shifts: [], members: [] })

  const isAdmin = activeOrg.role === OrgRole.ADMIN

  const [shifts, members] = await Promise.all([
    prisma.shift.findMany({
      where: { orgId: activeOrg.orgId, title: { contains: q, mode: 'insensitive' } },
      select: { id: true, title: true, startsAt: true },
      take: 8,
      orderBy: { startsAt: 'asc' },
    }),
    prisma.orgMember.findMany({
      where: { orgId: activeOrg.orgId, displayName: { contains: q, mode: 'insensitive' } },
      select: {
        id: true,
        displayName: true,
        role: true,
        user: { select: { id: true, name: true } },
      },
      take: 5,
    }),
  ])

  return Response.json({
    shifts: shifts.map((s) => ({ ...s, orgName: activeOrg.org.name })),
    members: members.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      role: m.role,
      ...(isAdmin && { realName: m.user.name }),
    })),
  })
}
