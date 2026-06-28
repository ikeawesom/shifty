'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ProfileModal({
  open,
  onClose,
  userName,
  userEmail,
  kindeUserId,
}: {
  open: boolean
  onClose: () => void
  userName: string | null
  userEmail: string
  kindeUserId: string
}) {
  const router = useRouter()
  const nameRef = useRef<HTMLInputElement>(null)
  const [nameSaved, setNameSaved] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  // kindeUserId reserved for future use (e.g. avatar fetching)
  void kindeUserId

  async function handleSaveName() {
    const name = nameRef.current?.value.trim() ?? ''
    setSaving(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 3000)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordReset() {
    await fetch('/api/user/password-reset', { method: 'POST' })
    setResetSent(true)
  }

  async function handleDeleteAccount() {
    const res = await fetch('/api/user/account', { method: 'DELETE' })
    if (res.ok) {
      const data = await res.json()
      if (data.logoutUrl) {
        window.location.href = data.logoutUrl
      } else {
        router.push('/')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Display Name */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Display Name</h3>
            <div className="flex gap-2">
              <input
                ref={nameRef}
                defaultValue={userName ?? ''}
                placeholder="Your name"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
            {nameSaved && <p className="text-xs text-green-600 mt-2">Name saved!</p>}
          </section>

          <hr className="border-border/60" />

          {/* Email */}
          <section>
            <h3 className="text-sm font-semibold mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Email cannot be changed.</p>
          </section>

          <hr className="border-border/60" />

          {/* Password */}
          <section>
            <h3 className="text-sm font-semibold mb-1">Password</h3>
            <p className="text-sm text-muted-foreground mb-3">
              We&apos;ll send a password reset link to your email.
            </p>
            <button
              onClick={handlePasswordReset}
              className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-muted/40 transition-colors"
            >
              Send reset email
            </button>
            {resetSent && <p className="text-xs text-green-600 mt-2">Reset email sent! Check your inbox.</p>}
          </section>

          <hr className="border-border/60" />

          {/* Danger Zone */}
          <section>
            <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600">This is permanent. All your data will be deleted.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
