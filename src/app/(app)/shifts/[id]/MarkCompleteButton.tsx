'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MarkCompleteButton({ shiftId }: { shiftId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/shifts/${shiftId}/complete`, { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? 'Failed to mark complete')
    }
  }

  return (
    <div className="flex flex-col gap-1">
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
