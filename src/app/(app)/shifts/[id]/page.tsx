import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Recurrence } from '@prisma/client'
import Link from 'next/link'
import MarkCompleteButton from './MarkCompleteButton'

type Params = Promise<{ id: string }>

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

export default async function ShiftDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const user = await syncUser()

  const membership = await prisma.orgMember.findFirst({
    where: { userId: user.id },
  })

  if (!membership) redirect('/org/new')

  const shift = await prisma.shift.findUnique({
    where: { id },
    include: {
      assignees: {
        include: { member: { include: { user: true } } },
      },
      completions: {
        include: { completedBy: { include: { user: true } } },
        orderBy: { completedAt: 'desc' },
      },
    },
  })

  if (!shift || shift.orgId !== membership.orgId) redirect('/shifts')

  const alreadyCompleted = shift.completions.some(
    (c) => c.completedById === membership.id,
  )

  const recurrenceLabel = RECURRENCE_LABEL[shift.recurrence]

  return (
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-2xl">
      <Link href="/shifts" className="text-sm text-muted-foreground hover:underline w-fit">
        ← Shifts
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{shift.title}</h1>
          {recurrenceLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {recurrenceLabel}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(shift.startsAt)} {formatTime(shift.startsAt)}
          {shift.endsAt && ` – ${formatDate(shift.endsAt)} ${formatTime(shift.endsAt)}`}
        </p>
        {shift.description && <p className="text-sm mt-1">{shift.description}</p>}
      </div>

      {shift.assignees.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Assignees</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            {shift.assignees.map((a) => (
              <li key={a.id}>{a.member.user.name ?? a.member.user.email}</li>
            ))}
          </ul>
        </section>
      )}

      {alreadyCompleted ? (
        <p className="text-sm text-muted-foreground">You have already marked this shift complete.</p>
      ) : (
        <MarkCompleteButton shiftId={shift.id} />
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Completion history</h2>
        {shift.completions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completions yet.</p>
        ) : (
          <ul className="divide-y border rounded-lg">
            {shift.completions.map((c) => (
              <li key={c.id} className="px-4 py-3 flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {c.completedBy.user.name ?? c.completedBy.user.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(c.completedAt)} {formatTime(c.completedAt)}
                </span>
                {c.notes && <span className="text-xs mt-1">{c.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
