import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8ff]">
      <div className="bg-white border border-border rounded-2xl p-12 shadow-sm text-center max-w-md w-full">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-bold tracking-tight mt-4">Page not found</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
