import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import { redirect } from 'next/navigation'
import DisplayNameForm from './DisplayNameForm'

export default async function ProfileSettingsPage() {
  const user = await syncUser()
  const membership = await getActiveOrg(user.id)
  if (!membership) redirect('/org/new')

  return (
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your identity within {membership.org.name}</p>
      </div>
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-semibold">Display Name</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Shown to other members in {membership.org.name}. Falls back to your account name when not set.
          </p>
        </div>
        <DisplayNameForm currentDisplayName={membership.displayName} fallbackName={user.name} />
      </div>
    </main>
  )
}
