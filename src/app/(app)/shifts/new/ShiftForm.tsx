'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Recurrence } from '@prisma/client'

interface Member {
  id: string
  user: { name: string | null; email: string }
}

interface ShiftFormProps {
  orgId: string
  members: Member[]
}

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'ONE_OFF', label: 'One-off' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
]

export default function ShiftForm({ orgId, members }: ShiftFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence>('ONE_OFF')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [error, setError] = useState('')

  function toggleAssignee(id: string) {
    setAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setError('')

    const res = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgId,
        title,
        description: description || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        recurrence,
        assigneeIds,
      }),
    })

    if (res.ok) {
      router.push('/shifts')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to create shift')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Morning shift"
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Any notes…"
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm font-medium">Starts at</label>
          <input
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm font-medium">Ends at <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Recurrence</label>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as Recurrence)}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
        >
          {RECURRENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Assignees</label>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members to assign.</p>
        ) : (
          <ul className="border rounded-lg divide-y">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                <input
                  type="checkbox"
                  id={`member-${m.id}`}
                  checked={assigneeIds.includes(m.id)}
                  onChange={() => toggleAssignee(m.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor={`member-${m.id}`} className="text-sm cursor-pointer">
                  {m.user.name ?? m.user.email}
                  {m.user.name && (
                    <span className="text-muted-foreground ml-1 text-xs">{m.user.email}</span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {status === 'saving' ? 'Creating…' : 'Create shift'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/shifts')}
          className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
