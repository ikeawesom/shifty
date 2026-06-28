'use client'

import { useState } from 'react'
import { Plan } from '@prisma/client'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const PLAN_RANK: Record<Plan, number> = {
  [Plan.FREE]: 0,
  [Plan.STARTER]: 1,
  [Plan.PRO]: 2,
  [Plan.ENTERPRISE]: 3,
}

const TIERS = [
  {
    plan: Plan.STARTER,
    name: 'Starter',
    highlighted: false,
    features: ['3 organizations', '20 members / org', '5 assignees / shift', 'Daily summary reminders'],
  },
  {
    plan: Plan.PRO,
    name: 'Pro',
    highlighted: true,
    features: ['8 organizations', '50 members / org', '10 assignees / shift', 'Daily + personal reminders'],
  },
  {
    plan: Plan.ENTERPRISE,
    name: 'Enterprise',
    highlighted: false,
    features: [
      'Unlimited organizations',
      'Unlimited members',
      'Unlimited assignees',
      'All reminder types',
    ],
  },
]

interface PricingCardsProps {
  currentPlan: Plan
  hasStripeCustomer: boolean
}

export default function PricingCards({ currentPlan, hasStripeCustomer }: PricingCardsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(plan: Plan) {
    setLoading(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal')
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  const busy = loading !== null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const isCurrent = tier.plan === currentPlan
          const isUpgrade = PLAN_RANK[tier.plan] > PLAN_RANK[currentPlan]

          return (
            <Card
              key={tier.plan}
              className={
                isCurrent
                  ? 'ring-2 ring-primary'
                  : tier.highlighted
                  ? 'ring-2 ring-primary/50'
                  : ''
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{tier.name}</CardTitle>
                  <div className="flex items-center gap-1.5">
                    {tier.highlighted && !isCurrent && (
                      <Badge className="text-[10px] uppercase tracking-wide px-1.5">Popular</Badge>
                    )}
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    className="w-full"
                    disabled={busy}
                    onClick={() => handleUpgrade(tier.plan)}
                  >
                    {loading === tier.plan ? 'Loading…' : 'Upgrade'}
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Downgrade via Manage Billing
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {hasStripeCustomer && (
        <div>
          <Button variant="outline" onClick={handlePortal} disabled={busy}>
            {loading === 'portal' ? 'Loading…' : 'Manage Billing'}
          </Button>
        </div>
      )}
    </div>
  )
}
