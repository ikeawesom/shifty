'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Users, Bell, CreditCard, Settings2, UserCog } from 'lucide-react'

const BASE_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/shifts', label: 'Shifts', icon: CalendarDays },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/settings/profile', label: 'My Profile', icon: UserCog },
]

const LEADER_LINKS = [
  { href: '/settings/reminders', label: 'Reminders', icon: Bell },
  { href: '/settings/billing', label: 'Billing', icon: CreditCard },
]

const ADMIN_LINKS = [
  { href: '/settings', label: 'Settings', icon: Settings2 },
]

export function SidebarNav({ isLeader, isOrgAdmin }: { isLeader: boolean; isOrgAdmin: boolean }) {
  const pathname = usePathname()
  const links = [
    ...BASE_LINKS,
    ...(isLeader ? LEADER_LINKS : []),
    ...(isOrgAdmin ? ADMIN_LINKS : []),
  ]

  return (
    <ul className="space-y-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === '/settings'
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/')
        return (
          <li key={href}>
            <Link
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary pl-2'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              ].join(' ')}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
