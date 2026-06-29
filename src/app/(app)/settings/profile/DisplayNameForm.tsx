'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DisplayNameForm({ currentDisplayName, fallbackName, disabled = false }: { currentDisplayName: string | null; fallbackName: string | null; disabled?: boolean }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    const displayName = inputRef.current?.value ?? ''
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/org-member/display-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })
      if (!res.ok) { setError((await res.json()).error ?? 'Failed to save'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } finally { setSaving(false) }
  }

  if (disabled) {
    return (
      <p className="text-sm text-muted-foreground italic">
        The admin does not allow using display names in this organisation.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          defaultValue={currentDisplayName ?? fallbackName ?? ''}
          placeholder="Your name in this organisation"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {saved && <p className="text-xs text-green-600">Display name saved!</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
