import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE() {
  const user = await syncUser()
  await prisma.user.delete({ where: { id: user.id } })
  const logoutUrl = `${process.env.KINDE_ISSUER_URL}/logout?redirect=${encodeURIComponent(process.env.KINDE_POST_LOGOUT_REDIRECT_URL ?? '/')}`
  return Response.json({ logoutUrl })
}
