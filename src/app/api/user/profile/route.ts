import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await syncUser()
  const { name } = (await req.json()) as { name?: string }
  await prisma.user.update({
    where: { id: user.id },
    data: { name: name?.trim() || null },
  })
  return Response.json({ ok: true })
}
