'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UndoCompletionButton({
  shiftId,
  completionId,
}: {
  shiftId: string
  completionId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/shifts/${shiftId}/complete/${completionId}`, {
      method: 'DELETE',
    })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? 'Failed to undo')
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
      >
        {loading ? 'Undoing…' : 'Undo'}
      </button>
      {error && <p className="text-xs text-destructive text-right">{error}</p>}
    </div>
  )
}
