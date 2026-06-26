import { syncUser } from '@/lib/auth'
import PricingCards from '@/components/billing/PricingCards'
import { Badge } from '@/components/ui/badge'

export default async function BillingPage() {
  const user = await syncUser()

  return (
    <main className="flex flex-col flex-1 gap-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Current plan:</span>
        <Badge variant="secondary">{user.plan}</Badge>
      </div>

      <PricingCards currentPlan={user.plan} hasStripeCustomer={!!user.stripeCustomerId} />
    </main>
  )
}
