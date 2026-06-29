'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MarkCompleteButton({ shiftId }: { shiftId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remarks, setRemarks] = useState('')

  async function handleClick() {
    setLoading(true)
    setError(null)
    const body: { notes?: string } = {}
    if (remarks.trim()) body.notes = remarks.trim()
    const res = await fetch(`/api/shifts/${shiftId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? 'Failed to mark complete')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Add remarks (optional)"
        rows={2}
        disabled={loading}
        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      />
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-fit px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Mark complete'}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
