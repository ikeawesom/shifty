'use client'

import { useState } from 'react'
import UndoCompletionButton from './UndoCompletionButton'

type Completion = {
  id: string
  completedByName: string
  completedAt: Date
  notes: string | null
  revertedAt: Date | null
  revertedByName: string | null
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString(undefined, { timeStyle: 'short' })
}

const NOTES_THRESHOLD = 100

export default function CompletionCard({
  completion,
  isAdmin,
  shiftId,
}: {
  completion: Completion
  isAdmin: boolean
  shiftId: string
}) {
  const [expanded, setExpanded] = useState(false)

  const isLongNotes =
    completion.notes !== null &&
    (completion.notes.length > NOTES_THRESHOLD || completion.notes.includes('\n'))

  return (
    <li className="px-4 py-3 flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            {completion.completedByName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(completion.completedAt)} {formatTime(completion.completedAt)}
          </span>
        </div>
        {isAdmin && completion.revertedAt === null && (
          <UndoCompletionButton shiftId={shiftId} completionId={completion.id} />
        )}
      </div>

      {completion.notes && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          <div
            className={[
              'text-xs overflow-hidden transition-[max-height] duration-300 ease-in-out leading-5',
              isLongNotes && !expanded ? 'max-h-5' : 'max-h-[2000px]',
            ].join(' ')}
          >
            {completion.notes}
          </div>
          {isLongNotes && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground w-fit transition-colors"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {completion.revertedAt !== null && completion.revertedByName && (
        <p className="text-xs text-muted-foreground mt-1">
          ↩ {completion.revertedByName} reverted{' '}
          {completion.completedByName}{"'s shift"} ·{' '}
          {formatDate(completion.revertedAt)} {formatTime(completion.revertedAt)}
        </p>
      )}
    </li>
  )
}
