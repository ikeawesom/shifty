import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Shifty',
    template: '%s | Shifty',
  },
  description:
    'Assign shifts, track completions, and automate reminders — all in one place for team leaders.',
  openGraph: {
    type: 'website',
    siteName: 'Shifty',
    title: 'Shifty — Shift & Task Delegation for Teams',
    description:
      'Assign shifts, track completions, and automate reminders — all in one place for team leaders.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shifty — Shift & Task Delegation for Teams',
    description:
      'Assign shifts, track completions, and automate reminders — all in one place for team leaders.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
