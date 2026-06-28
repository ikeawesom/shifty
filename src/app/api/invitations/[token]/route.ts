import type { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrgRole, PlatformRole } from '@prisma/client'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  const kindeUser = await getUser()
  if (!kindeUser) {
    redirect(`/api/auth/login?post_login_redirect_url=/api/invitations/${token}`)
  }

  const invitation = await prisma.invitation.findUnique({ where: { token } })

  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
    redirect('/dashboard?invite=invalid')
  }

  if (kindeUser.email !== invitation.email) {
    redirect('/dashboard?invite=mismatch')
  }

  const name = [kindeUser.given_name, kindeUser.family_name].filter(Boolean).join(' ') || null

  const user = await prisma.user.upsert({
    where: { kindeId: kindeUser.id },
    update: { email: kindeUser.email, name },
    create: {
      kindeId: kindeUser.id,
      email: kindeUser.email,
      name,
      platformRole: PlatformRole.MEMBER,
    },
  })

  await prisma.orgMember.upsert({
    where: { userId_orgId: { userId: user.id, orgId: invitation.orgId } },
    update: {},
    create: { userId: user.id, orgId: invitation.orgId, role: OrgRole.MEMBER },
  })

  await prisma.invitation.update({
    where: { token },
    data: { acceptedAt: new Date() },
  })

  const org = await prisma.organization.findUnique({
    where: { id: invitation.orgId },
    select: { ownerId: true, name: true },
  })
  if (org) {
    await prisma.notification.create({
      data: {
        userId: org.ownerId,
        type: 'MEMBER_JOINED',
        title: 'New member joined',
        body: `${user.name ?? user.email} joined ${org.name}.`,
      },
    })
  }

  redirect('/dashboard')
}
