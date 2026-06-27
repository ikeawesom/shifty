import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OrgRole, Recurrence } from '@prisma/client'
import Link from 'next/link'

const RECURRENCE_LABEL: Record<Recurrence, string | null> = {
  ONE_OFF: null,
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { timeStyle: 'short' })
}

export default async function ShiftsPage() {
  const user = await syncUser()

  const membership = await prisma.orgMember.findFirst({
    where: { userId: user.id },
    include: { org: true },
  })

  if (!membership) redirect('/org/new')

  const isAdmin = membership.role === OrgRole.ADMIN

  const shifts = await prisma.shift.findMany({
    where: { orgId: membership.org.id },
    include: {
      assignees: {
        include: { member: { include: { user: true } } },
      },
    },
    orderBy: { startsAt: 'asc' },
  })

  return (
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shifts</h1>
        {isAdmin && (
          <Link
            href="/shifts/new"
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md"
          >
            New shift
          </Link>
        )}
      </div>

      {shifts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No shifts yet.</p>
      ) : (
        <ul className="divide-y border rounded-lg">
          {shifts.map((shift) => {
            const recurrenceLabel = RECURRENCE_LABEL[shift.recurrence]
            return (
              <li key={shift.id} className="px-4 py-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{shift.title}</span>
                  {recurrenceLabel && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {recurrenceLabel}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {formatDate(shift.startsAt)} {formatTime(shift.startsAt)}
                  {shift.endsAt && ` – ${formatDate(shift.endsAt)} ${formatTime(shift.endsAt)}`}
                </p>

                {shift.description && (
                  <p className="text-xs text-muted-foreground">{shift.description}</p>
                )}

                {shift.assignees.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Assigned to:{' '}
                    {shift.assignees
                      .map((a) => a.member.user.name ?? a.member.user.email)
                      .join(', ')}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
