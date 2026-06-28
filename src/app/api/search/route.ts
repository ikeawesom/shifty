import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await syncUser()
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return Response.json({ shifts: [], members: [] })

  const activeOrg = await getActiveOrg(user.id)
  if (!activeOrg) return Response.json({ shifts: [], members: [] })

  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id },
    select: { orgId: true, org: { select: { name: true } } },
  })
  const orgMap = Object.fromEntries(memberships.map((m) => [m.orgId, m.org.name]))
  const orgIds = Object.keys(orgMap)

  const shifts = await prisma.shift.findMany({
    where: {
      orgId: { in: orgIds },
      title: { contains: q, mode: 'insensitive' },
    },
    select: { id: true, title: true, orgId: true, startsAt: true },
    take: 8,
    orderBy: { startsAt: 'asc' },
  })

  const members = await prisma.orgMember.findMany({
    where: {
      orgId: activeOrg.id,
      user: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
    },
    select: {
      role: true,
      user: { select: { id: true, name: true, email: true } },
    },
    take: 5,
  })

  return Response.json({
    shifts: shifts.map((s) => ({ ...s, orgName: orgMap[s.orgId] })),
    members: members.map((m) => ({ id: m.user.id, name: m.user.name, email: m.user.email, role: m.role })),
  })
}
