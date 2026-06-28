import { syncUser } from '@/lib/auth'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { OrgRole, PlatformRole } from '@prisma/client'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { ACTIVE_ORG_COOKIE } from '@/lib/org'
import { PLAN_ORG_LIMITS } from '@/lib/plans'
import OrgSwitcher from '@/components/org/OrgSwitcher'
import { SidebarNav } from '@/components/app/SidebarNav'
import ProfileMenu from '@/components/app/ProfileMenu'
import MobileSidebar from '@/components/app/MobileSidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await syncUser()

  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id },
    include: { org: { select: { id: true, name: true, ownerId: true } } },
    orderBy: { joinedAt: 'asc' },
  })

  const cookieStore = await cookies()
  const activeId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value
  const activeMembership = memberships.find((m) => m.orgId === activeId) ?? memberships[0]

  const ownedCount = memberships.filter((m) => m.org.ownerId === user.id).length
  const atOrgLimit = ownedCount >= PLAN_ORG_LIMITS[user.plan]
  const isLeader = user.platformRole === PlatformRole.ORG_LEADER
  const isOrgAdmin = activeMembership?.role === OrgRole.ADMIN

  const orgs = memberships.map((m) => ({ id: m.org.id, name: m.org.name }))

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 border-r border-border/60 bg-white/95 backdrop-blur-sm flex-col z-40">
        <div className="h-14 flex items-center px-6 border-b border-border/60 shrink-0">
          <Link
            href="/dashboard"
            className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5"
          >
            <Zap className="size-4" />
            Shifty
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <SidebarNav isLeader={isLeader} isOrgAdmin={isOrgAdmin} />
        </nav>

        <div className="border-t border-border/60 px-3 py-3 space-y-1 shrink-0">
          {orgs.length > 0 && (
            <OrgSwitcher
              orgs={orgs}
              activeOrgId={activeMembership?.orgId ?? ''}
              activeOrgName={activeMembership?.org.name ?? ''}
              atOrgLimit={atOrgLimit}
            />
          )}
          <ProfileMenu
            userName={user.name}
            userEmail={user.email}
            kindeUserId={user.kindeId}
          />
        </div>
      </aside>

      {/* Mobile header — only visible on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 border-b border-border/60 bg-white/95 backdrop-blur-sm flex items-center px-4 gap-3">
        <MobileSidebar
          isLeader={isLeader}
          isOrgAdmin={isOrgAdmin}
          orgs={orgs}
          activeOrgId={activeMembership?.orgId ?? ''}
          activeOrgName={activeMembership?.org.name ?? ''}
          atOrgLimit={atOrgLimit}
          userName={user.name}
          userEmail={user.email}
          kindeUserId={user.kindeId}
        />
        <Link href="/dashboard" className="font-bold text-sm text-primary flex items-center gap-1.5">
          <Zap className="size-4" />
          Shifty
        </Link>
      </div>

      {/* Main content */}
      <div className="md:ml-64 flex flex-col flex-1 min-h-screen mt-14 md:mt-0">
        {children}
      </div>
    </div>
  )
}
