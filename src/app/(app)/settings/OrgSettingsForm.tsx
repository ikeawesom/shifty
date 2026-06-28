'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function OrgSettingsForm({
  orgId,
  currentName,
}: {
  orgId: string
  currentName: string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    const name = inputRef.current?.value.trim()
    if (!name) { setError('Name cannot be empty'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/orgs/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to save')
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Organisation Name</label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            defaultValue={currentName}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {saved && <p className="text-xs text-green-600">Name updated!</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
