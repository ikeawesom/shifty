import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const user = await syncUser()
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return Response.json(notifications)
}

export async function PATCH() {
  const user = await syncUser()
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  })
  return Response.json({ ok: true })
}
