import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await syncUser()
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return Response.json({ shifts: [] })

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

  return Response.json({
    shifts: shifts.map((s) => ({ ...s, orgName: orgMap[s.orgId] })),
  })
}
