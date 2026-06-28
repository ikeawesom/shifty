import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PLAN_MEMBER_LIMITS,
  PLAN_ASSIGNEE_LIMITS,
  PLAN_ORG_LIMITS,
} from '@/lib/plans'
import {
  CalendarDays,
  Users,
  Bell,
  Building2,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

function fmt(n: number) {
  return n === Infinity ? '∞' : String(n)
}

const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    priceNote: 'No credit card required',
    description: 'Perfect for small teams just getting started.',
    features: [
      '1 organization',
      '10 members per org',
      '1 assignee per shift',
      'Dashboard overview',
      'Basic shift management',
    ],
    cta: 'Get started free',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$9',
    priceNote: 'per month',
    description: 'Great for growing teams managing multiple groups.',
    features: [
      '3 organizations',
      '20 members per org',
      '5 assignees per shift',
      'Daily summary reminders',
    ],
    cta: 'Get started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    priceNote: 'per month',
    description: 'For teams that need more power and automation.',
    features: [
      '8 organizations',
      '50 members per org',
      '10 assignees per shift',
      'Daily + personal reminders',
      'Assignee-specific alerts',
    ],
    cta: 'Get started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceNote: null,
    description: 'Unlimited scale for large or multi-site operations.',
    features: [
      'Unlimited organizations',
      'Unlimited members',
      'Unlimited assignees',
      'All reminder types',
      'Pre-shift alerts',
      'Priority support',
    ],
    cta: 'Contact us',
    popular: false,
  },
]

export default async function HomePage() {
  const user = await getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative text-center px-6 pt-28 pb-24 max-w-3xl mx-auto">
          <div className="absolute -top-16 -right-10 size-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-40 -left-20 size-64 bg-violet-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <Sparkles className="size-3" />
            Shift management, simplified
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
            style={{ animationDelay: '100ms' }}
          >
            Manage shifts.<br />Delegate tasks.<br />
            <span className="text-primary">Run your team.</span>
          </h1>

          <p
            className="text-xl text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
            style={{ animationDelay: '200ms' }}
          >
            Shifty helps teams assign shifts, track completions, and send reminders — all in one place.
          </p>

          <div
            className="flex items-center justify-center gap-4 flex-wrap animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
            style={{ animationDelay: '300ms' }}
          >
            <RegisterLink className="inline-flex items-center gap-2 justify-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-base font-medium hover:bg-primary/90 transition-colors shadow-sm">
              Get started free <ArrowRight className="size-4" />
            </RegisterLink>
            <LoginLink className="inline-flex items-center justify-center rounded-full border border-input bg-background px-8 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
              Sign in
            </LoginLink>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="px-6 py-16 border-t">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              <h2 className="text-3xl font-bold tracking-tight mb-3">How it works</h2>
              <p className="text-muted-foreground">Three simple steps to a better-run team.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  step: '1',
                  icon: CalendarDays,
                  title: 'Schedule shifts',
                  desc: 'Create one-off or recurring shifts in seconds. Assign members, set dates, and add notes.',
                  delay: '0ms',
                },
                {
                  step: '2',
                  icon: CheckCircle2,
                  title: 'Assign & track',
                  desc: 'Assign multiple team members per shift. Track completions in real time from your dashboard.',
                  delay: '150ms',
                },
                {
                  step: '3',
                  icon: Bell,
                  title: 'Automated reminders',
                  desc: 'Daily summaries and pre-shift alerts sent automatically so nothing slips through.',
                  delay: '300ms',
                },
              ].map(({ step, icon: Icon, title, desc, delay }) => (
                <div
                  key={title}
                  className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                  style={{ animationDelay: delay }}
                >
                  <div className="relative inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary mb-4">
                    <Icon className="size-6" />
                    <span className="absolute -top-2 -right-2 size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES (BENTO GRID) ── */}
        <section id="features" className="px-6 py-20 bg-[#faf8ff]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-wide mb-4">
                <Sparkles className="size-3" />
                Platform Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Everything your team needs
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                A complete platform for shift and task management — built for teams that move fast.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Large: Shift Scheduling */}
              <div className="md:col-span-8 bg-white border border-border rounded-2xl p-8 overflow-hidden hover:-translate-y-1 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                      <CalendarDays className="size-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Shift Scheduling</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      Create one-off or recurring shifts in seconds. Assign multiple members, set start and end times, and get a complete view of your team&apos;s schedule.
                    </p>
                    <ul className="space-y-2.5">
                      {[
                        'Recurring shifts (daily, weekly, monthly)',
                        'Multi-assignee support per shift',
                        'Real-time completion tracking',
                      ].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="size-4 text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1 min-h-[180px] bg-muted/40 rounded-xl border border-border/60 p-4 flex flex-col gap-2.5">
                    {[
                      { label: '9:00 AM – 5:00 PM', name: 'Opening Shift', accent: true },
                      { label: '2:00 PM – 10:00 PM', name: 'Afternoon Shift', accent: false },
                      { label: '10:00 PM – 6:00 AM', name: 'Night Shift', accent: true },
                    ].map((s) => (
                      <div
                        key={s.name}
                        className={`bg-white px-3 py-2.5 rounded-lg shadow-sm border-l-[3px] ${s.accent ? 'border-primary' : 'border-muted-foreground/30'}`}
                      >
                        <div className="text-[10px] text-muted-foreground">{s.label}</div>
                        <div className="text-sm font-medium mt-0.5">{s.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Small: Instant Alerts – purple card */}
              <div className="md:col-span-4 bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '100ms' }}>
                <div>
                  <Bell className="size-10 mb-5 opacity-90" />
                  <h3 className="text-xl font-semibold mb-3">Instant Alerts</h3>
                  <p className="text-sm opacity-80 leading-relaxed">
                    Daily summaries and pre-shift alerts sent automatically. Your team always knows what&apos;s coming.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  {['Daily summary', 'Pre-shift alert', 'Personal reminders'].map((tag) => (
                    <span key={tag} className="text-[11px] font-medium bg-white/20 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Small: Team Invites */}
              <div className="md:col-span-4 bg-white border border-border rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '150ms' }}>
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <Users className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Team Invites</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Invite members via email with one click. They join instantly — no separate sign-up required.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { name: 'Alex Reed', tag: 'Active', active: true },
                    { name: 'Sam Torres', tag: 'Pending', active: false },
                  ].map((m) => (
                    <div key={m.name} className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-lg">
                      <span className="text-sm font-medium">{m.name}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {m.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Large: Multi-Org */}
              <div className="md:col-span-8 bg-white border border-border rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '200ms' }}>
                <div className="flex flex-col md:flex-row-reverse gap-8 items-start">
                  <div className="flex-1">
                    <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                      <Building2 className="size-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Multi-Org Management</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      Manage multiple organizations from one account. Switch between teams instantly and keep every workspace isolated.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Role-based access', 'Instant org switcher', 'Isolated workspaces'].map((tag) => (
                        <span key={tag} className="text-xs border border-primary/20 text-primary px-3 py-1 rounded-full font-medium bg-primary/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2.5">
                    {[
                      { name: 'Acme Corp', active: true },
                      { name: 'Night Crew', active: false },
                      { name: 'Weekend Team', active: false },
                    ].map((org) => (
                      <div key={org.name} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${org.active ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
                        <div className={`size-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${org.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {org.name[0]}
                        </div>
                        <span className="text-sm font-medium flex-1">{org.name}</span>
                        {org.active && <span className="text-[11px] text-primary font-semibold">Active</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-muted-foreground">Start free. Scale as your team grows.</p>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {PRICING_TIERS.map((tier, i) => (
                <div
                  key={tier.name}
                  className={[
                    'relative flex flex-col rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both',
                    tier.popular
                      ? 'border-2 border-primary shadow-md'
                      : 'border border-border bg-white',
                  ].join(' ')}
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                        <Sparkles className="size-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <h2 className="font-bold text-lg mb-2">{tier.name}</h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      {tier.priceNote && (
                        <span className="text-sm text-muted-foreground">{tier.priceNote}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {tier.description}
                  </p>

                  <ul className="space-y-2 text-sm mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <RegisterLink
                    className={[
                      'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      tier.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-input bg-background hover:bg-muted',
                    ].join(' ')}
                  >
                    {tier.cta}
                  </RegisterLink>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '300ms' }}>
              <h3 className="text-xl font-bold text-center mb-8">Compare all features</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Feature</TableHead>
                    <TableHead>Free</TableHead>
                    <TableHead>Starter</TableHead>
                    <TableHead className="text-primary font-semibold">Pro</TableHead>
                    <TableHead>Enterprise</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Price</TableCell>
                    <TableCell className="font-semibold">Free</TableCell>
                    <TableCell>$9/mo</TableCell>
                    <TableCell>$29/mo</TableCell>
                    <TableCell className="text-muted-foreground">Custom</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Organizations</TableCell>
                    <TableCell>{fmt(PLAN_ORG_LIMITS.FREE)}</TableCell>
                    <TableCell>{fmt(PLAN_ORG_LIMITS.STARTER)}</TableCell>
                    <TableCell>{fmt(PLAN_ORG_LIMITS.PRO)}</TableCell>
                    <TableCell>{fmt(PLAN_ORG_LIMITS.ENTERPRISE)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Members / org</TableCell>
                    <TableCell>{fmt(PLAN_MEMBER_LIMITS.FREE)}</TableCell>
                    <TableCell>{fmt(PLAN_MEMBER_LIMITS.STARTER)}</TableCell>
                    <TableCell>{fmt(PLAN_MEMBER_LIMITS.PRO)}</TableCell>
                    <TableCell>{fmt(PLAN_MEMBER_LIMITS.ENTERPRISE)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Assignees / shift</TableCell>
                    <TableCell>{fmt(PLAN_ASSIGNEE_LIMITS.FREE)}</TableCell>
                    <TableCell>{fmt(PLAN_ASSIGNEE_LIMITS.STARTER)}</TableCell>
                    <TableCell>{fmt(PLAN_ASSIGNEE_LIMITS.PRO)}</TableCell>
                    <TableCell>{fmt(PLAN_ASSIGNEE_LIMITS.ENTERPRISE)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Email reminders</TableCell>
                    <TableCell className="text-muted-foreground">None</TableCell>
                    <TableCell>Daily summary</TableCell>
                    <TableCell>Daily + Personal</TableCell>
                    <TableCell>Daily + Personal + Pre-shift</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      <RegisterLink className="inline-flex items-center justify-center rounded-full border border-input bg-background px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                        Get started free
                      </RegisterLink>
                    </TableCell>
                    <TableCell>
                      <RegisterLink className="inline-flex items-center justify-center rounded-full border border-input bg-background px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                        Get started
                      </RegisterLink>
                    </TableCell>
                    <TableCell>
                      <RegisterLink className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors">
                        Get started
                      </RegisterLink>
                    </TableCell>
                    <TableCell>
                      <RegisterLink className="inline-flex items-center justify-center rounded-full border border-input bg-background px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                        Contact us
                      </RegisterLink>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <div className="relative rounded-3xl bg-[#1a1b2e] overflow-hidden px-8 py-16 text-center">
              <div className="absolute -top-24 -left-24 size-72 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 size-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white/80 px-3 py-1 text-xs font-medium mb-6">
                  <Zap className="size-3" />
                  No credit card required
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to get your team organized?
                </h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Join teams already running their shifts on Shifty. Free to start — upgrade anytime.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <RegisterLink className="inline-flex items-center gap-2 justify-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-base font-medium hover:bg-primary/90 transition-colors">
                    Get started free <ArrowRight className="size-4" />
                  </RegisterLink>
                  <LoginLink className="inline-flex items-center justify-center rounded-full border border-white/20 text-white px-8 py-3 text-base font-medium hover:bg-white/10 transition-colors">
                    Sign in
                  </LoginLink>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  )
}
