import { syncUser } from '@/lib/auth'
import { getActiveOrg } from '@/lib/org'
import { PlatformRole } from '@prisma/client'
import { redirect } from 'next/navigation'
import ReminderSettingsForm from '@/components/org/ReminderSettingsForm'

export default async function RemindersPage() {
  const user = await syncUser()

  if (user.platformRole !== PlatformRole.ORG_LEADER) {
    redirect('/dashboard')
  }

  const activeOrg = await getActiveOrg(user.id)

  if (!activeOrg) {
    redirect('/org/new')
  }

  if (activeOrg.org.ownerId !== user.id) {
    return (
      <main className="flex flex-col flex-1 gap-6 p-8 max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold">Reminders</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure email reminders for your organisation</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Only the organisation owner can configure reminders.
        </p>
      </main>
    )
  }

  return (
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Reminders</h1>
        <p className="text-muted-foreground mt-1 text-sm">Configure email reminders for your organisation</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <p className="text-sm text-muted-foreground mb-6">
          Configuring reminders for <strong>{activeOrg.org.name}</strong>
        </p>
        <ReminderSettingsForm
          plan={user.plan}
          currentType={activeOrg.org.reminderType}
          currentHourUtc={activeOrg.org.reminderHourUtc}
          currentLeadMinutes={activeOrg.org.reminderLeadMinutes}
        />
      </div>
    </main>
  )
}
