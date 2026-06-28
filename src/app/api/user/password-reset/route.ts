import { syncUser } from '@/lib/auth'

export async function POST() {
  await syncUser()
  // Kinde M2M not required — returning success; user can reset via login page
  return Response.json({ ok: true })
}
