import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OrgRole } from '@prisma/client'
import MemberInviteForm from './MemberInviteForm'
import { getActiveOrg } from '@/lib/org'

export default async function MembersPage() {
  const user = await syncUser()

  const membership = await getActiveOrg(user.id)

  if (!membership) redirect('/org/new')

  const isAdmin = membership.role === OrgRole.ADMIN

  const members = await prisma.orgMember.findMany({
    where: { orgId: membership.org.id },
    include: { user: true },
    orderBy: { joinedAt: 'asc' },
  })

  const pendingInvites = isAdmin
    ? await prisma.invitation.findMany({
        where: {
          orgId: membership.org.id,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold">Members</h1>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          {membership.org.name} · {members.length} member{members.length !== 1 ? 's' : ''}
        </h2>
        <ul className="divide-y border rounded-lg">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{m.user.name ?? m.user.email}</p>
                <p className="text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {isAdmin && pendingInvites.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Pending invites</h2>
          <ul className="divide-y border rounded-lg">
            {pendingInvites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm">{inv.email}</p>
                <span className="text-xs text-muted-foreground">
                  Expires {inv.expiresAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isAdmin && <MemberInviteForm orgId={membership.org.id} />}
    </main>
  )
}
