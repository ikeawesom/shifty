import Link from 'next/link'
import { Zap } from 'lucide-react'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components'

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/40 bg-[#faf8ff] px-6 py-8 text-sm text-muted-foreground">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 font-bold text-primary text-base">
          <Zap className="size-4" />
          Shifty
        </div>
        <span className="text-xs">© 2026 Shifty. All rights reserved.</span>
        <nav className="flex items-center gap-5">
          <a href="/#pricing" className="hover:text-foreground transition-colors text-xs">
            Pricing
          </a>
          <LoginLink className="hover:text-foreground transition-colors text-xs">Sign in</LoginLink>
          <RegisterLink className="hover:text-foreground transition-colors text-xs">Get started</RegisterLink>
        </nav>
      </div>
    </footer>
  )
}
