import { syncUser } from '@/lib/auth'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { PlatformRole } from '@prisma/client'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/server'
import Link from 'next/link'
import { ACTIVE_ORG_COOKIE } from '@/lib/org'
import { PLAN_ORG_LIMITS } from '@/lib/plans'
import OrgSwitcher from '@/components/org/OrgSwitcher'

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

  const orgs = memberships.map((m) => ({ id: m.org.id, name: m.org.name }))

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 h-12 flex items-center gap-6 shrink-0">
        <Link href="/dashboard" className="font-semibold text-sm tracking-tight">
          Shifty
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/shifts"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Shifts
          </Link>
          <Link
            href="/members"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Members
          </Link>
          {isLeader && (
            <>
              <Link
                href="/settings/reminders"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Reminders
              </Link>
              <Link
                href="/settings/billing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Billing
              </Link>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {orgs.length > 0 && (
            <OrgSwitcher
              orgs={orgs}
              activeOrgId={activeMembership?.orgId ?? ''}
              activeOrgName={activeMembership?.org.name ?? ''}
              atOrgLimit={atOrgLimit}
            />
          )}
          <LogoutLink className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign out
          </LogoutLink>
        </div>
      </header>
      {children}
    </div>
  )
}
