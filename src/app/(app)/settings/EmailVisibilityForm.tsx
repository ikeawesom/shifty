'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EmailVisibilityForm({ showEmail }: { showEmail: boolean }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(showEmail)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function toggle() {
    const next = !enabled
    setEnabled(next)
    setSaving(true)
    try {
      await fetch('/api/org-member/email-visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showEmail: next }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.push(window.location.pathname)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium">Show my email to other members</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          When off, your email is partially hidden from other members. Admins always see the full address.
        </p>
        {saved && <p className="text-xs text-green-600 mt-1">Preference saved!</p>}
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        disabled={saving}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'disabled:opacity-60',
          enabled ? 'bg-primary' : 'bg-muted-foreground/30',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            enabled ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
