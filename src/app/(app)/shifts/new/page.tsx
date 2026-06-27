import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OrgRole } from '@prisma/client'
import ShiftForm from './ShiftForm'

export default async function NewShiftPage() {
  const user = await syncUser()

  const membership = await prisma.orgMember.findFirst({
    where: { userId: user.id },
    include: { org: true },
  })

  if (!membership) redirect('/org/new')
  if (membership.role !== OrgRole.ADMIN) redirect('/shifts')

  const members = await prisma.orgMember.findMany({
    where: { orgId: membership.org.id },
    include: { user: true },
    orderBy: { joinedAt: 'asc' },
  })

  const memberData = members.map((m) => ({
    id: m.id,
    user: { name: m.user.name, email: m.user.email },
  }))

  return (
    <main className="flex flex-col flex-1 gap-6 p-8">
      <h1 className="text-2xl font-semibold">New shift</h1>
      <ShiftForm orgId={membership.org.id} members={memberData} />
    </main>
  )
}
