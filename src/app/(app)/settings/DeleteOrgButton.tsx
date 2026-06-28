'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteOrgButton({
  orgId,
  orgName,
}: {
  orgId: string
  orgName: string
}) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [input, setInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (input !== orgName) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/orgs/${orgId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } finally {
      setDeleting(false)
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        Delete Organisation
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-red-600">
        Type <strong>{orgName}</strong> to confirm deletion.
      </p>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={orgName}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
      />
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={input !== orgName || deleting}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {deleting ? 'Deleting…' : 'Confirm Delete'}
        </button>
        <button
          onClick={() => { setConfirm(false); setInput('') }}
          className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-muted/40 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
