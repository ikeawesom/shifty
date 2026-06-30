import { syncUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { OrgRole } from '@prisma/client'
import { getActiveOrg, resolveMemberName } from '@/lib/org'
import {
  CalendarDays, Users, TrendingUp, CheckCircle2, Clock, type LucideIcon,
} from 'lucide-react'
import NotificationBell from '@/components/app/NotificationBell'
import GlobalSearch from '@/components/app/GlobalSearch'

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { timeStyle: 'short' })
}

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function getShiftStatus(
  shift: { startsAt: Date; endsAt: Date | null; completions: { id: string }[] },
  now: Date,
) {
  if (shift.completions.length > 0) return 'completed'
  if (shift.startsAt <= now && (shift.endsAt === null || shift.endsAt >= now)) return 'active'
  return 'upcoming'
}

export default async function DashboardPage() {
  const user = await syncUser()
  const membership = await getActiveOrg(user.id)
  if (!membership) redirect('/org/new')

  const isAdmin = membership.role === OrgRole.ADMIN
  const orgId = membership.orgId
  const now = new Date()

  // ── Admin branch ─────────────────────────────────────────────────────────
  if (isAdmin) {
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)
    const startOfToday = new Date(todayStart)

    const [
      totalShifts, totalMembers, totalAssignees, totalCompletions, todayShifts,
      orgShifts, orgMembers, activeAssigneeIds, recentCompletions,
    ] = await Promise.all([
      prisma.shift.count({ where: { orgId } }),
      prisma.orgMember.count({ where: { orgId } }),
      prisma.shiftAssignee.count({ where: { shift: { orgId } } }),
      prisma.shiftCompletion.count({ where: { shift: { orgId }, revertedAt: null } }),
      prisma.shift.count({ where: { orgId, startsAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.shift.findMany({
        where: { orgId, startsAt: { gte: startOfToday } },
        include: {
          assignees: { include: { member: { include: { user: true } } } },
          completions: { where: { revertedAt: null }, select: { id: true } },
        },
        orderBy: { startsAt: 'asc' },
        take: 6,
      }),
      prisma.orgMember.findMany({
        where: { orgId },
        include: { user: true },
        orderBy: { joinedAt: 'asc' },
        take: 8,
      }),
      prisma.shiftAssignee.findMany({
        where: {
          shift: {
            orgId,
            startsAt: { lte: now },
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
        },
        select: { memberId: true },
      }),
      prisma.shiftCompletion.findMany({
        where: { shift: { orgId }, revertedAt: null },
        include: {
          shift: { select: { id: true, title: true } },
          completedBy: { include: { user: true } },
        },
        orderBy: { completedAt: 'desc' },
        take: 6,
      }),
    ])

    const onShiftSet = new Set(activeAssigneeIds.map((a) => a.memberId))
    const rate = totalAssignees > 0 ? Math.round((totalCompletions / totalAssignees) * 100) : 0

    const stats: { label: string; value: string | number; icon: LucideIcon }[] = [
      { label: 'Total Shifts', value: totalShifts, icon: CalendarDays },
      { label: 'Members', value: totalMembers, icon: Users },
      { label: "Today's Shifts", value: todayShifts, icon: Clock },
      { label: 'Completion Rate', value: `${rate}%`, icon: TrendingUp },
    ]

    return (
      <div className="flex flex-col flex-1">
        {/* Top admin bar */}
        <header className="hidden md:flex h-14 sticky top-0 z-30 border-b border-border/60 bg-white/95 backdrop-blur-sm items-center gap-4 px-8 shrink-0">
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell userId={user.id} />
          </div>
        </header>

        <main className="flex-1 p-8 space-y-8">
          {/* Greeting */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {user.name ?? 'there'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Here&apos;s what&apos;s happening at{' '}
              <span className="font-medium text-foreground">{membership.org.name}</span> today.
            </p>
          </div>

          {/* 4 stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {s.label}
                  </p>
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <s.icon className="size-4 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Shifts Overview — col-span-8 */}
            <div className="col-span-12 lg:col-span-8 bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold">Shifts Overview</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Scheduled from today · {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
                <Link href="/shifts" className="text-xs text-primary font-medium hover:underline">
                  View all →
                </Link>
              </div>

              {orgShifts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-xl">
                  <CalendarDays className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No shifts created yet.</p>
                  <Link href="/shifts/new" className="text-sm text-primary hover:underline mt-1 inline-block">
                    Create one →
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {orgShifts.map((shift) => {
                    const status = getShiftStatus(shift, now)
                    return (
                      <li key={shift.id}>
                        <Link
                          href={`/shifts/${shift.id}`}
                          className="flex items-center gap-4 border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all group bg-white"
                        >
                          <div className="w-1 self-stretch bg-primary shrink-0" />
                          <div className="flex items-center gap-4 flex-1 px-4 py-3 min-w-0">
                            <div className="text-center w-16 shrink-0">
                              <p className="text-xs font-bold">{formatTime(shift.startsAt)}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">Start</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                {shift.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {shift.assignees.length > 0
                                  ? shift.assignees
                                      .map((a) => resolveMemberName(a.member, membership.org.nameMode))
                                      .join(', ')
                                  : 'Unassigned'}
                              </p>
                            </div>
                            <span
                              className={[
                                'text-xs px-2.5 py-1 rounded-full font-medium shrink-0',
                                status === 'active'
                                  ? 'bg-primary/10 text-primary'
                                  : status === 'completed'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-muted text-muted-foreground',
                              ].join(' ')}
                            >
                              {status === 'active' ? 'In Progress' : status === 'completed' ? 'Done' : 'Upcoming'}
                            </span>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Right column — col-span-4, stacked */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              {/* Team Status */}
              <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                <h3 className="text-base font-semibold mb-4">Team Status</h3>
                {orgMembers.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="size-7 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No members yet.</p>
                    <Link href="/members" className="text-sm text-primary hover:underline mt-1 inline-block">
                      Invite someone →
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {orgMembers.map((m) => {
                      const isOnShift = onShiftSet.has(m.id)
                      return (
                        <li key={m.id} className="flex items-center gap-3">
                          <div className="relative">
                            <div className="size-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center uppercase">
                              {resolveMemberName(m, membership.org.nameMode).charAt(0)}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white ${
                                isOnShift ? 'bg-green-500' : 'bg-muted-foreground/30'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {resolveMemberName(m, membership.org.nameMode)}
                            </p>
                            <p className={`text-xs ${isOnShift ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {isOnShift ? 'On Shift' : 'Off Duty'}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                <h3 className="text-base font-semibold mb-4">Recent Activity</h3>
                {recentCompletions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No recent activity yet.</p>
                ) : (
                  <div className="relative pl-6 flex flex-col gap-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {recentCompletions.map((c) => (
                      <div key={c.id} className="relative flex items-start gap-3">
                        <div className="absolute -left-[19px] top-1 size-3 rounded-full bg-primary ring-4 ring-white shrink-0" />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm truncate">
                            <span className="font-medium">
                              {resolveMemberName(c.completedBy, membership.org.nameMode)}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Member branch ─────────────────────────────────────────────────────────
  const [myAssigned, myCompletions] = await Promise.all([
    prisma.shiftAssignee.count({ where: { memberId: membership.id } }),
    prisma.shiftCompletion.count({ where: { completedById: membership.id, revertedAt: null } }),
  ])
  const rate = myAssigned > 0 ? Math.round((myCompletions / myAssigned) * 100) : 0
  const memberStats: { label: string; value: string | number; icon: LucideIcon }[] = [
    { label: 'My Shifts', value: myAssigned, icon: CalendarDays },
    { label: 'Completed', value: myCompletions, icon: CheckCircle2 },
    { label: 'My Completion Rate', value: `${rate}%`, icon: TrendingUp },
  ]

  const [upcomingAssignees, recentCompletions] = await Promise.all([
    prisma.shiftAssignee.findMany({
      where: {
        memberId: membership.id,
        shift: {
          orgId,
          startsAt: { gt: now },
          completions: { none: { completedById: membership.id, revertedAt: null } },
        },
      },
      include: { shift: true },
      orderBy: { shift: { startsAt: 'asc' } },
      take: 5,
    }),
    prisma.shiftCompletion.findMany({
      where: { shift: { orgId }, revertedAt: null },
      include: {
        shift: { select: { id: true, title: true } },
        completedBy: { include: { user: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    }),
  ])

  return (
    <main className="flex flex-col flex-1 gap-8 p-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{user.name ? `, ${user.name}` : ''}.{' '}
          <span className="font-medium text-foreground">{membership.org.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {memberStats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="size-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{s.value}</p>
          </div>
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
            <ul className="flex flex-col gap-2">
              {upcomingAssignees.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/shifts/${a.shift.id}`}
                    className="flex items-center gap-3 border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className="w-1 self-stretch bg-primary shrink-0" />
                    <div className="flex items-center gap-3 flex-1 px-3 py-3 min-w-0">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <CalendarDays className="size-3.5 text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {a.shift.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(a.shift.startsAt)} · {formatTime(a.shift.startsAt)}
                          {a.shift.endsAt && ` – ${formatTime(a.shift.endsAt)}`}
                        </span>
                      </div>
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
            <div className="relative pl-6 flex flex-col gap-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {recentCompletions.map((c) => (
                <div key={c.id} className="relative flex items-start gap-3">
                  <div className="absolute -left-[19px] top-1 size-3 rounded-full bg-primary ring-4 ring-white shrink-0" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm truncate">
                      <span className="font-medium">
                        {resolveMemberName(c.completedBy, membership.org.nameMode)}
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
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
