import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OrgRole } from '@prisma/client'
import MemberInviteForm from './MemberInviteForm'
import { getActiveOrg, resolveMemberName, censorEmail } from '@/lib/org'

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
    <main className="flex flex-col flex-1 gap-6 p-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Members</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {membership.org.name} · {members.length} member{members.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: members.length },
          { label: 'Pending Invites', value: pendingInvites.length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Members table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Member</th>
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium">{resolveMemberName(m, membership.org.nameMode)}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin || m.userId === user.id || m.showEmail
                        ? m.user.email
                        : censorEmail(m.user.email)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={[
                      'text-xs px-2.5 py-1 rounded-full font-semibold',
                      m.role === OrgRole.ADMIN
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    ].join(' ')}
                  >
                    {m.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {m.joinedAt.toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending invites */}
      {isAdmin && pendingInvites.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3">Pending Invites</h2>
          <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingInvites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm">{inv.email}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {inv.expiresAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isAdmin && <MemberInviteForm orgId={membership.org.id} />}
    </main>
  )
}
