import { syncUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/server'
import Link from 'next/link'
import { PlatformRole } from '@prisma/client'

export default async function DashboardPage() {
  const user = await syncUser()

  const membership = await prisma.orgMember.findFirst({
    where: { userId: user.id },
    include: { org: true },
  })

  if (!membership) redirect('/org/new')

  const isLeader = user.platformRole === PlatformRole.ORG_LEADER

  return (
    <main className="flex flex-col flex-1 gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutLink className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Sign out
        </LogoutLink>
      </div>

      <p className="text-muted-foreground">
        Welcome back{user.name ? `, ${user.name}` : ''}. You&apos;re in{' '}
        <span className="font-medium text-foreground">{membership.org.name}</span>.
      </p>

      <nav className="flex gap-4 text-sm">
        <Link href="/members" className="text-muted-foreground hover:text-foreground transition-colors">
          Members
        </Link>
        {isLeader && (
          <Link href="/settings/billing" className="text-muted-foreground hover:text-foreground transition-colors">
            Billing
          </Link>
        )}
      </nav>
    </main>
  )
}
