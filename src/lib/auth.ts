import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { PlatformRole } from '@prisma/client'

export async function getUser() {
  const { getUser: getKindeUser, isAuthenticated } = getKindeServerSession()
  if (!(await isAuthenticated())) return null
  return await getKindeUser()
}

export async function requireUser() {
  const user = await getUser()
  if (!user) redirect('/api/auth/login')
  return user
}

export async function syncUser() {
  const kindeUser = await requireUser()

  if (!kindeUser.email) throw new Error('Kinde user has no email')

  const name = [kindeUser.given_name, kindeUser.family_name]
    .filter(Boolean)
    .join(' ')

  return prisma.user.upsert({
    where: { kindeId: kindeUser.id },
    update: { email: kindeUser.email, name: name || null },
    create: {
      kindeId: kindeUser.id,
      email: kindeUser.email,
      name: name || null,
      platformRole: PlatformRole.ORG_LEADER,
    },
  })
}
