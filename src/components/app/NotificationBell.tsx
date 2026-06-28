'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'

type Notification = {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data: Notification[]) => {
        setNotifications(data)
        setUnread(data.filter((n) => !n.read).length)
      })
      .catch(() => {})
  }, [userId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    setOpen((prev) => {
      if (!prev && unread > 0) {
        fetch('/api/notifications', { method: 'PATCH' }).catch(() => {})
        setUnread(0)
      }
      return !prev
    })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 top-10 z-50 w-80 bg-white border border-border rounded-2xl shadow-lg transition-all duration-200 origin-top-right ${
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-sm font-semibold">Notifications</h4>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-border max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id} className="px-4 py-3 hover:bg-muted/40 transition-colors">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTimeAgo(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
