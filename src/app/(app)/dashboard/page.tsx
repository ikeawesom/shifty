import { syncUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/server'
import Link from 'next/link'
import { OrgRole, PlatformRole } from '@prisma/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { timeStyle: 'short' })
}

export default async function DashboardPage() {
  const user = await syncUser()

  const membership = await prisma.orgMember.findFirst({
    where: { userId: user.id },
    include: { org: true },
  })

  if (!membership) redirect('/org/new')

  const isAdmin = membership.role === OrgRole.ADMIN
  const isLeader = user.platformRole === PlatformRole.ORG_LEADER
  const orgId = membership.orgId
  const now = new Date()

  let stats: { label: string; value: string | number }[]

  if (isAdmin) {
    const [totalShifts, totalMembers, totalAssignees, totalCompletions] = await Promise.all([
      prisma.shift.count({ where: { orgId } }),
      prisma.orgMember.count({ where: { orgId } }),
      prisma.shiftAssignee.count({ where: { shift: { orgId } } }),
      prisma.shiftCompletion.count({ where: { shift: { orgId } } }),
    ])
    const rate = totalAssignees > 0 ? Math.round((totalCompletions / totalAssignees) * 100) : 0
    stats = [
      { label: 'Total Shifts', value: totalShifts },
      { label: 'Members', value: totalMembers },
      { label: 'Completion Rate', value: `${rate}%` },
    ]
  } else {
    const [myAssigned, myCompletions] = await Promise.all([
      prisma.shiftAssignee.count({ where: { memberId: membership.id } }),
      prisma.shiftCompletion.count({ where: { completedById: membership.id } }),
    ])
    const rate = myAssigned > 0 ? Math.round((myCompletions / myAssigned) * 100) : 0
    stats = [
      { label: 'My Shifts', value: myAssigned },
      { label: 'Completed', value: myCompletions },
      { label: 'My Completion Rate', value: `${rate}%` },
    ]
  }

  const [upcomingAssignees, recentCompletions] = await Promise.all([
    prisma.shiftAssignee.findMany({
      where: {
        memberId: membership.id,
        shift: {
          orgId,
          startsAt: { gt: now },
          completions: { none: { completedById: membership.id } },
        },
      },
      include: { shift: true },
      orderBy: { shift: { startsAt: 'asc' } },
      take: 5,
    }),
    prisma.shiftCompletion.findMany({
      where: { shift: { orgId } },
      include: {
        shift: { select: { id: true, title: true } },
        completedBy: { include: { user: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    }),
  ])

  return (
    <main className="flex flex-col flex-1 gap-8 p-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutLink className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Sign out
        </LogoutLink>
      </div>

      <p className="text-muted-foreground -mt-4">
        Welcome back{user.name ? `, ${user.name}` : ''}. You&apos;re in{' '}
        <span className="font-medium text-foreground">{membership.org.name}</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">My Upcoming Shifts</h2>
          {upcomingAssignees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming shifts assigned to you.</p>
          ) : (
            <ul className="divide-y border rounded-lg">
              {upcomingAssignees.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/shifts/${a.shift.id}`}
                    className="px-4 py-3 flex flex-col gap-0.5 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium">{a.shift.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(a.shift.startsAt)} {formatTime(a.shift.startsAt)}
                      {a.shift.endsAt && ` – ${formatTime(a.shift.endsAt)}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Recent Activity</h2>
          {recentCompletions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completions in this org yet.</p>
          ) : (
            <ul className="divide-y border rounded-lg">
              {recentCompletions.map((c) => (
                <li key={c.id} className="px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-sm">
                    <span className="font-medium">
                      {c.completedBy.user.name ?? c.completedBy.user.email}
                    </span>
                    {' completed '}
                    <Link
                      href={`/shifts/${c.shift.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.shift.title}
                    </Link>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(c.completedAt)} {formatTime(c.completedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <nav className="flex items-center gap-4 pt-2 border-t">
        <Link href="/shifts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Shifts
        </Link>
        <Link href="/members" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Members
        </Link>
        {isLeader && (
          <Link href="/settings/billing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Billing
          </Link>
        )}
      </nav>
    </main>
  )
}
