import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const user = await getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="flex flex-col items-center justify-center flex-1 gap-6 p-8">
      <h1 className="text-4xl font-bold">Shifty</h1>
      <p className="text-muted-foreground text-lg">
        Shift and task delegation management for teams.
      </p>
      <div className="flex gap-4">
        <Link
          href="/api/auth/login"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/api/auth/register"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Create account
        </Link>
      </div>
    </main>
  )
}
