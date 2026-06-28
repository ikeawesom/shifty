import { syncUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { OrgRole } from '@prisma/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getActiveOrg } from '@/lib/org'
import { CalendarDays, Users, TrendingUp, CheckCircle2, type LucideIcon } from 'lucide-react'

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { timeStyle: 'short' })
}

export default async function DashboardPage() {
  const user = await syncUser()

  const membership = await getActiveOrg(user.id)

  if (!membership) redirect('/org/new')

  const isAdmin = membership.role === OrgRole.ADMIN
  const orgId = membership.orgId
  const now = new Date()

  let stats: { label: string; value: string | number; icon: LucideIcon }[]

  if (isAdmin) {
    const [totalShifts, totalMembers, totalAssignees, totalCompletions] = await Promise.all([
      prisma.shift.count({ where: { orgId } }),
      prisma.orgMember.count({ where: { orgId } }),
      prisma.shiftAssignee.count({ where: { shift: { orgId } } }),
      prisma.shiftCompletion.count({ where: { shift: { orgId } } }),
    ])
    const rate = totalAssignees > 0 ? Math.round((totalCompletions / totalAssignees) * 100) : 0
    stats = [
      { label: 'Total Shifts', value: totalShifts, icon: CalendarDays },
      { label: 'Members', value: totalMembers, icon: Users },
      { label: 'Completion Rate', value: `${rate}%`, icon: TrendingUp },
    ]
  } else {
    const [myAssigned, myCompletions] = await Promise.all([
      prisma.shiftAssignee.count({ where: { memberId: membership.id } }),
      prisma.shiftCompletion.count({ where: { completedById: membership.id } }),
    ])
    const rate = myAssigned > 0 ? Math.round((myCompletions / myAssigned) * 100) : 0
    stats = [
      { label: 'My Shifts', value: myAssigned, icon: CalendarDays },
      { label: 'Completed', value: myCompletions, icon: CheckCircle2 },
      { label: 'My Completion Rate', value: `${rate}%`, icon: TrendingUp },
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{user.name ? `, ${user.name}` : ''}. You&apos;re in{' '}
          <span className="font-medium text-foreground">{membership.org.name}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="size-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">My Upcoming Shifts</h2>
          </div>
          {upcomingAssignees.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">No upcoming shifts assigned to you.</p>
            </div>
          ) : (
            <ul className="divide-y border rounded-xl overflow-hidden">
              {upcomingAssignees.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/shifts/${a.shift.id}`}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarDays className="size-3.5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{a.shift.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(a.shift.startsAt)} · {formatTime(a.shift.startsAt)}
                        {a.shift.endsAt && ` – ${formatTime(a.shift.endsAt)}`}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Recent Activity</h2>
          </div>
          {recentCompletions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">No completions in this org yet.</p>
            </div>
          ) : (
            <ul className="divide-y border rounded-xl overflow-hidden">
              {recentCompletions.map((c) => (
                <li key={c.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-3.5 text-green-600" />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm truncate">
                      <span className="font-medium">
                        {c.completedBy.user.name ?? c.completedBy.user.email}
                      </span>
                      {' completed '}
                      <Link
                        href={`/shifts/${c.shift.id}`}
                        className="font-medium hover:underline hover:text-primary"
                      >
                        {c.shift.title}
                      </Link>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(c.completedAt)} · {formatTime(c.completedAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

    </main>
  )
}
