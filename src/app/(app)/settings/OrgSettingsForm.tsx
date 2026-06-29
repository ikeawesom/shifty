'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { NameMode } from '@prisma/client'

export default function OrgSettingsForm({
  orgId,
  currentName,
  currentNameMode,
}: {
  orgId: string
  currentName: string
  currentNameMode: NameMode
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameMode, setNameMode] = useState<NameMode>(currentNameMode)
  const [modeSaving, setModeSaving] = useState(false)
  const [modeSaved, setModeSaved] = useState(false)

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
      router.push(window.location.pathname)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleNameModeChange(mode: NameMode) {
    setNameMode(mode)
    setModeSaving(true)
    try {
      await fetch(`/api/orgs/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameMode: mode }),
      })
      setModeSaved(true)
      setTimeout(() => setModeSaved(false), 3000)
      router.push(window.location.pathname)
      router.refresh()
    } finally {
      setModeSaving(false)
    }
  }

  return (
    <div className="space-y-5">
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

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Member Name Display</label>
        <p className="text-xs text-muted-foreground">
          Controls how member names appear across shifts, dashboard, and member lists.
        </p>
        <div className="flex flex-col gap-2 mt-2">
          {(
            [
              { value: NameMode.ACCOUNT_NAME, label: 'Use Account Name', desc: 'Shows the name from each member\'s account profile.' },
              { value: NameMode.DISPLAY_NAME, label: 'Use Display Name', desc: 'Shows the org-specific display name, falling back to account name.' },
            ] as const
          ).map(({ value, label, desc }) => (
            <label
              key={value}
              className={[
                'flex items-start gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors',
                nameMode === value
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border hover:border-primary/30',
              ].join(' ')}
            >
              <input
                type="radio"
                name="nameMode"
                value={value}
                checked={nameMode === value}
                onChange={() => handleNameModeChange(value)}
                disabled={modeSaving}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </label>
          ))}
        </div>
        {modeSaved && <p className="text-xs text-green-600">Display mode updated!</p>}
      </div>
    </div>
  )
}
