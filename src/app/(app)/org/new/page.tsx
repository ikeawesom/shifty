import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PLAN_ORG_LIMITS } from '@/lib/plans'
import Link from 'next/link'
import OrgCreateForm from './OrgCreateForm'

export default async function NewOrgPage() {
  const user = await syncUser()

  const ownedOrgCount = await prisma.organization.count({
    where: { ownerId: user.id },
  })

  const limit = PLAN_ORG_LIMITS[user.plan]
  const atLimit = ownedOrgCount >= limit

  if (atLimit) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 gap-8 p-8">
        <div className="w-full max-w-md space-y-4 rounded-lg border p-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Organisation limit reached</h1>
            <p className="text-muted-foreground text-sm">
              Your <span className="font-medium">{user.plan}</span> plan allows up to{' '}
              <span className="font-medium">{limit === Infinity ? 'unlimited' : limit}</span>{' '}
              owned organisation{limit === 1 ? '' : 's'}. You currently own{' '}
              <span className="font-medium">{ownedOrgCount}</span>.
            </p>
          </div>
          <Link
            href="/settings/billing"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Manage billing →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 gap-8 p-8">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Create your organisation</h1>
          <p className="text-muted-foreground text-sm">
            You can add members and create shifts after setup.
          </p>
        </div>
        <OrgCreateForm />
      </div>
    </main>
  )
}
