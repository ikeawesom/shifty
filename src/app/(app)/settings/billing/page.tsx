import { syncUser } from '@/lib/auth'
import PricingCards from '@/components/billing/PricingCards'
import { Badge } from '@/components/ui/badge'

export default async function BillingPage() {
  const user = await syncUser()

  return (
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your subscription and plan</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Current Plan</p>
          <Badge variant="secondary" className="text-sm">{user.plan}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">Upgrade or manage below</p>
      </div>

      <PricingCards currentPlan={user.plan} hasStripeCustomer={!!user.stripeCustomerId} />
    </main>
  )
}
