'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrgCreateForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setError(null)
    setUpgradeRequired(false)

    const res = await fetch('/api/orgs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (res.status === 201) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    const data = await res.json()
    setStatus('error')
    setError(data.error ?? 'Something went wrong')
    if (data.upgradeRequired) setUpgradeRequired(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Organisation name
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          placeholder="Acme Inc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {status === 'error' && error && (
        <p className="text-sm text-destructive">
          {error}
          {upgradeRequired && (
            <>
              {' '}
              <Link href="/settings/billing" className="underline">
                Upgrade plan →
              </Link>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'saving' ? 'Creating…' : 'Create organisation'}
      </button>
    </form>
  )
}
