import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default async function HomePage() {
  const user = await getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 h-12 flex items-center gap-6 shrink-0">
        <span className="font-semibold text-sm tracking-tight">Shifty</span>
        <nav className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LoginLink className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </LoginLink>
          <RegisterLink className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors">
            Get started
          </RegisterLink>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="text-center px-6 py-24 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Manage shifts.<br />Delegate tasks.<br />Run your team.
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Shifty helps teams assign shifts, track completions, and send reminders — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <RegisterLink className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3 text-base font-medium hover:bg-primary/90 transition-colors">
              Get started free
            </RegisterLink>
            <LoginLink className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
              Sign in
            </LoginLink>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Everything your team needs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold">Shift Management</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create one-off or recurring shifts with assignees, dates, and descriptions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold">Team Invites</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Invite members via email. They join instantly — no separate registration needed.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold">Multi-Org</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage multiple organizations from a single account and switch between them instantly.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold">Email Reminders</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Automated daily summaries and pre-shift alerts keep your team on track.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Simple pricing</h2>
              <p className="text-muted-foreground">Start free. Upgrade as your team grows.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { name: 'Free', desc: '1 org · 10 members' },
                { name: 'Starter', desc: '3 orgs · 20 members' },
                { name: 'Pro', desc: '8 orgs · 50 members' },
                { name: 'Enterprise', desc: 'Unlimited everything' },
              ].map((tier) => (
                <div key={tier.name} className="border rounded-lg p-4 text-center">
                  <div className="font-semibold mb-1">{tier.name}</div>
                  <div className="text-sm text-muted-foreground">{tier.desc}</div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/pricing"
                className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                See full pricing →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-sm text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 Shifty. All rights reserved.</span>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <LoginLink className="hover:text-foreground transition-colors">Sign in</LoginLink>
            <RegisterLink className="hover:text-foreground transition-colors">Get started</RegisterLink>
          </nav>
        </div>
      </footer>
    </div>
  )
}
