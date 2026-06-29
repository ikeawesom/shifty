import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OrgRole, Recurrence } from '@prisma/client'
import Link from 'next/link'
import MarkCompleteButton from './MarkCompleteButton'
import ShiftEditForm from './ShiftEditForm'
import CompletionCard from './CompletionCard'
import { getActiveOrg, resolveMemberName } from '@/lib/org'

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

  const membership = await getActiveOrg(user.id)

  if (!membership) redirect('/org/new')

  const shift = await prisma.shift.findUnique({
    where: { id },
    include: {
      assignees: {
        include: { member: { include: { user: true } } },
      },
      completions: {
        include: {
          completedBy: { include: { user: true } },
          revertedBy: { include: { user: true } },
        },
        orderBy: { completedAt: 'desc' },
      },
    },
  })

  if (!shift || shift.orgId !== membership.orgId) redirect('/shifts')

  const isAdmin = membership.role === OrgRole.ADMIN
  const { nameMode } = membership.org

  const isAssigned = shift.assignees.some((a) => a.memberId === membership.id)
  const canMarkComplete = isAdmin || isAssigned

  const alreadyCompleted = shift.completions.some(
    (c) => c.completedById === membership.id && c.revertedAt === null,
  )

  const recurrenceLabel = RECURRENCE_LABEL[shift.recurrence]

  const orgMembers = isAdmin
    ? await prisma.orgMember.findMany({
        where: { orgId: membership.orgId },
        include: { user: true },
      })
    : []

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

      {isAdmin && (
        <ShiftEditForm
          shift={{
            id: shift.id,
            title: shift.title,
            description: shift.description,
            startsAt: shift.startsAt,
            endsAt: shift.endsAt,
            recurrence: shift.recurrence,
            assignees: shift.assignees.map((a) => ({ memberId: a.memberId })),
          }}
          orgMembers={orgMembers.map((m) => ({
            id: m.id,
            name: resolveMemberName(m, nameMode),
            email: m.user.email,
          }))}
        />
      )}

      {shift.assignees.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Assignees</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            {shift.assignees.map((a) => (
              <li key={a.id}>{resolveMemberName(a.member, nameMode)}</li>
            ))}
          </ul>
        </section>
      )}

      {canMarkComplete && (
        alreadyCompleted ? (
          <p className="text-sm text-muted-foreground">You have already marked this shift complete.</p>
        ) : (
          <MarkCompleteButton shiftId={shift.id} />
        )
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Completion history</h2>
        {shift.completions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completions yet.</p>
        ) : (
          <ul className="divide-y border rounded-lg">
            {shift.completions.map((c) => (
              <CompletionCard
                key={c.id}
                completion={{
                  id: c.id,
                  completedByName: resolveMemberName(c.completedBy, nameMode),
                  completedAt: c.completedAt,
                  notes: c.notes,
                  revertedAt: c.revertedAt,
                  revertedByName: c.revertedBy
                    ? resolveMemberName(c.revertedBy, nameMode)
                    : null,
                }}
                isAdmin={isAdmin}
                shiftId={shift.id}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
