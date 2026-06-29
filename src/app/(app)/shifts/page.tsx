import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OrgRole, Recurrence } from '@prisma/client'
import Link from 'next/link'
import { getActiveOrg, resolveMemberName } from '@/lib/org'

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

function getShiftTags(
  shift: {
    startsAt: Date
    endsAt: Date | null
    completions: { id: string }[]
    assignees: { id: string }[]
  },
  now: Date,
) {
  const completedCount = shift.completions.length
  const assigneeCount = shift.assignees.length
  const fullyCompleted = assigneeCount > 0 ? completedCount >= assigneeCount : completedCount > 0

  const tags: { label: string; className: string }[] = []

  if (now < shift.startsAt) {
    tags.push({ label: 'Upcoming', className: 'bg-muted text-muted-foreground' })
  } else if (!shift.endsAt || now <= shift.endsAt) {
    tags.push({ label: 'In Progress', className: 'bg-primary/10 text-primary' })
  } else if (!fullyCompleted) {
    tags.push({ label: 'Overdue', className: 'bg-red-50 text-red-700' })
  }

  if (fullyCompleted) {
    tags.push({ label: 'Completed', className: 'bg-green-50 text-green-700' })
  }

  return tags
}

export default async function ShiftsPage() {
  const user = await syncUser()

  const membership = await getActiveOrg(user.id)

  if (!membership) redirect('/org/new')

  const isAdmin = membership.role === OrgRole.ADMIN

  const shifts = await prisma.shift.findMany({
    where: { orgId: membership.org.id },
    include: {
      assignees: {
        include: { member: { include: { user: true } } },
      },
      completions: { where: { revertedAt: null }, select: { id: true } },
    },
    orderBy: { startsAt: 'asc' },
  })

  const now = new Date()

  return (
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shifts</h1>
        {isAdmin && (
          <Link
            href="/shifts/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm"
          >
            New shift
          </Link>
        )}
      </div>

      {shifts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No shifts yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {shifts.map((shift) => {
            const recurrenceLabel = RECURRENCE_LABEL[shift.recurrence]
            const tags = getShiftTags(shift, now)
            return (
              <li key={shift.id}>
                <Link
                  href={`/shifts/${shift.id}`}
                  className="flex items-stretch border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all group bg-white"
                >
                  <div className="w-1 bg-primary shrink-0" />
                  <div className="flex flex-col gap-1.5 px-5 py-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {shift.title}
                      </span>
                      {recurrenceLabel && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {recurrenceLabel}
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
                        {tags.map((tag) => (
                          <span
                            key={tag.label}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${tag.className}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          {shift.completions.length}/{shift.assignees.length} done
                        </span>
                      </div>
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
                        {shift.assignees.map((a) => resolveMemberName(a.member, membership.org.nameMode)).join(', ')}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
