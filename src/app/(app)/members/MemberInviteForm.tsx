'use client'

import { useState } from 'react'

export default function MemberInviteForm({ orgId }: { orgId: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, orgId }),
    })

    if (res.ok) {
      setStatus('sent')
      setEmail('')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to send invite')
      setStatus('error')
    }
  }

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Invite a member</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="member@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send invite'}
        </button>
      </form>
      {status === 'sent' && (
        <p className="text-sm text-green-600 mt-2">Invitation sent!</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </section>
  )
}
