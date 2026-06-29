'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plan, ReminderType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

type ReminderOption = {
  value: ReminderType
  label: string
  description: string
  badge: string | null
}

const REMINDER_OPTIONS: ReminderOption[] = [
  {
    value: ReminderType.NONE,
    label: 'Disabled',
    description: 'No email reminders will be sent.',
    badge: null,
  },
  {
    value: ReminderType.ALL_DAILY_SUMMARY,
    label: 'Daily summary — all members',
    description: 'Every member receives a summary of all org shifts that day, at the configured time.',
    badge: 'Starter+',
  },
  {
    value: ReminderType.ASSIGNEE_DAILY_SUMMARY,
    label: 'Daily summary — assigned members only',
    description: 'Only members with shifts that day receive a summary of all org shifts.',
    badge: 'Pro+',
  },
  {
    value: ReminderType.ASSIGNEE_OWN_SHIFT,
    label: 'Personal shift summary',
    description: 'Only members with shifts that day receive a summary of their own shifts.',
    badge: 'Pro+',
  },
  {
    value: ReminderType.ASSIGNEE_PRE_SHIFT,
    label: 'Pre-shift alert',
    description: 'Members receive an alert about their own shift a set amount of time before it starts.',
    badge: 'Enterprise',
  },
]

const PLAN_ORDER: Plan[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE']

const TYPE_MIN_PLAN: Record<ReminderType, Plan | null> = {
  NONE: null,
  ALL_DAILY_SUMMARY: 'STARTER',
  ASSIGNEE_DAILY_SUMMARY: 'PRO',
  ASSIGNEE_OWN_SHIFT: 'PRO',
  ASSIGNEE_PRE_SHIFT: 'ENTERPRISE',
}

function planMeets(userPlan: Plan, minPlan: Plan | null): boolean {
  if (!minPlan) return true
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(minPlan)
}

const DAILY_SUMMARY_TYPES = new Set<ReminderType>([
  ReminderType.ALL_DAILY_SUMMARY,
  ReminderType.ASSIGNEE_DAILY_SUMMARY,
  ReminderType.ASSIGNEE_OWN_SHIFT,
])

export default function ReminderSettingsForm({
  plan,
  currentType,
  currentHourUtc,
  currentLeadMinutes,
}: {
  plan: Plan
  currentType: ReminderType
  currentHourUtc: number
  currentLeadMinutes: number
}) {
  const router = useRouter()
  const [type, setType] = useState<ReminderType>(currentType)
  const [hourUtc, setHourUtc] = useState<string>(
    `${String(currentHourUtc).padStart(2, '0')}:00`
  )
  const [leadValue, setLeadValue] = useState<number>(() => {
    if (currentLeadMinutes % 1440 === 0) return currentLeadMinutes / 1440
    if (currentLeadMinutes % 60 === 0) return currentLeadMinutes / 60
    return currentLeadMinutes
  })
  const [leadUnit, setLeadUnit] = useState<'minutes' | 'hours' | 'days'>(() => {
    if (currentLeadMinutes % 1440 === 0) return 'days'
    if (currentLeadMinutes % 60 === 0) return 'hours'
    return 'minutes'
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const leadMinutes =
      leadUnit === 'days' ? leadValue * 1440 : leadUnit === 'hours' ? leadValue * 60 : leadValue
    const reminderHourUtc = parseInt(hourUtc.split(':')[0], 10)

    const res = await fetch('/api/orgs/reminders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reminderType: type,
        reminderHourUtc: reminderHourUtc,
        reminderLeadMinutes: leadMinutes,
      }),
    })

    setSaving(false)

    if (res.ok) {
      setMessage({ text: 'Reminder settings saved.', error: false })
      router.refresh()
    } else {
      const data = (await res.json()) as { error?: string }
      setMessage({ text: data.error ?? 'Failed to save settings.', error: true })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
      <div className="flex flex-col gap-3">
        {REMINDER_OPTIONS.map((opt) => {
          const allowed = planMeets(plan, TYPE_MIN_PLAN[opt.value])
          return (
            <label
              key={opt.value}
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                type === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              } ${!allowed ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="reminderType"
                value={opt.value}
                checked={type === opt.value}
                disabled={!allowed}
                onChange={() => setType(opt.value)}
                className="mt-0.5 shrink-0 accent-primary"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {opt.badge && (
                    <Badge variant="outline" className="text-xs">
                      {opt.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </div>
            </label>
          )
        })}
      </div>

      {type !== ReminderType.NONE && DAILY_SUMMARY_TYPES.has(type) && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="hourUtc">Send time (UTC)</Label>
          <input
            id="hourUtc"
            type="time"
            step={3600}
            value={hourUtc}
            onChange={(e) => setHourUtc(e.target.value)}
            className="w-32 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm"
          />
          <span className="text-xs text-muted-foreground">
            Default is 07:00 UTC. The cron runs hourly; emails are sent on the matching hour.
          </span>
        </div>
      )}

      {type === ReminderType.ASSIGNEE_PRE_SHIFT && (
        <div className="flex flex-col gap-2">
          <Label>Alert lead time</Label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={leadValue}
              onChange={(e) => setLeadValue(Math.max(1, Number(e.target.value)))}
              className="w-24 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm"
            />
            <select
              value={leadUnit}
              onChange={(e) => setLeadUnit(e.target.value as 'minutes' | 'hours' | 'days')}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm"
            >
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
              <option value="days">days</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground">
            How far in advance to send the alert. Default is 1 hour.
          </span>
        </div>
      )}

      {message && (
        <p className={`text-sm ${message.error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? 'Saving…' : 'Save settings'}
      </Button>
    </form>
  )
}
