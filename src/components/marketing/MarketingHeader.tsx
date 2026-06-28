'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components'

export function MarketingHeader() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    const sections = ['features', 'pricing']
    const observers: IntersectionObserver[] = []

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
          }
        },
        { threshold: 0.3 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/80 backdrop-blur-md h-16 shrink-0">
      <div className="max-w-7xl mx-auto h-full flex items-center px-6">
        <Link
          href="/"
          className="font-bold text-base tracking-tight text-primary flex items-center gap-1.5 shrink-0"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          <Zap className="size-5" />
          Shifty
        </Link>

        <div className="ml-auto flex items-center gap-5">
          <a
            href="#features"
            className={`text-sm transition-colors ${
              activeSection === 'features'
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Features
          </a>
          <a
            href="#pricing"
            className={`text-sm transition-colors ${
              activeSection === 'pricing'
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pricing
          </a>
          <div className="h-4 w-px bg-border mx-1" />
          <LoginLink className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
            Sign in
          </LoginLink>
          <RegisterLink className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            Get started
          </RegisterLink>
        </div>
      </div>
    </header>
  )
}
