'use client'

import { useState, useRef, useEffect } from 'react'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { User, LogOut } from 'lucide-react'
import ProfileModal from './ProfileModal'

export default function ProfileMenu({
  userName,
  userEmail,
  kindeUserId,
}: {
  userName: string | null
  userEmail: string
  kindeUserId: string
}) {
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors w-full text-left"
      >
        <div className="size-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 uppercase">
          {(userName ?? userEmail).charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{userName ?? 'My Account'}</p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>
      </button>

      <div
        className={`absolute bottom-full left-0 mb-2 w-52 bg-white border border-border rounded-xl shadow-lg z-50 transition-all duration-200 origin-bottom-left ${
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <button
          onClick={() => { setOpen(false); setModalOpen(true) }}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted/40 transition-colors rounded-t-xl"
        >
          <User className="size-4 text-muted-foreground" />
          My Profile
        </button>
        <div className="border-t border-border/60" />
        <LogoutLink className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl">
          <LogOut className="size-4" />
          Sign Out
        </LogoutLink>
      </div>

      <ProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userName={userName}
        userEmail={userEmail}
        kindeUserId={kindeUserId}
      />
    </div>
  )
}
