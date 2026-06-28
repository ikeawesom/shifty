import Link from 'next/link'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 h-12 flex items-center gap-6 shrink-0">
        <Link href="/" className="font-semibold text-sm tracking-tight">
          Shifty
        </Link>
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
      <main className="flex-1">{children}</main>
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
