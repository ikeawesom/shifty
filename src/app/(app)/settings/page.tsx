import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import { OrgRole } from '@prisma/client'
import { redirect } from 'next/navigation'
import OrgSettingsForm from './OrgSettingsForm'
import DeleteOrgButton from './DeleteOrgButton'

export default async function SettingsPage() {
  const user = await syncUser()
  const membership = await getActiveOrg(user.id)
  if (!membership || membership.role !== OrgRole.ADMIN) redirect('/dashboard')

  return (
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage {membership.org.name}</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold">Organisation</h2>
        <OrgSettingsForm orgId={membership.orgId} currentName={membership.org.name} />
      </div>

      <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Deleting the organisation is permanent and cannot be undone.
        </p>
        <DeleteOrgButton orgId={membership.orgId} orgName={membership.org.name} />
      </div>
    </main>
  )
}
