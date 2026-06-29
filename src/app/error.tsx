'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8ff]">
      <div className="bg-white border border-border rounded-2xl p-12 shadow-sm text-center max-w-md w-full">
        <p className="text-4xl">⚠</p>
        <h1 className="text-2xl font-bold tracking-tight mt-4">Something went wrong</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-3 mt-6 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-input bg-background px-8 py-3 rounded-full hover:bg-accent transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
