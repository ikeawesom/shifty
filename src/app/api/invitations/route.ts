import type { NextRequest } from 'next/server'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendInviteEmail } from '@/lib/email'
import { PLAN_MEMBER_LIMITS } from '@/lib/plans'
import { OrgRole } from '@prisma/client'

export async function POST(req: NextRequest) {
  const user = await syncUser()
  const { email, orgId } = (await req.json()) as { email: string; orgId: string }

  if (!email || !orgId) {
    return Response.json({ error: 'Missing email or orgId' }, { status: 400 })
  }

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
    include: { org: true },
  })

  if (!membership || membership.role !== OrgRole.ADMIN) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const memberCount = await prisma.orgMember.count({ where: { orgId } })
  const limit = PLAN_MEMBER_LIMITS[user.plan]
  if (memberCount >= limit) {
    return Response.json(
      { error: `Member limit reached for your ${user.plan} plan` },
      { status: 403 },
    )
  }

  const existing = await prisma.invitation.findFirst({
    where: { email, orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
  })
  if (existing) {
    return Response.json({ error: 'Invitation already sent to this email' }, { status: 409 })
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const invitation = await prisma.invitation.create({
    data: { email, orgId, invitedById: user.id, expiresAt },
  })

  const baseUrl = process.env.KINDE_SITE_URL ?? 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/api/invitations/${invitation.token}`

  await sendInviteEmail({
    to: email,
    orgName: membership.org.name,
    inviterName: user.name ?? user.email,
    inviteUrl,
  })

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    await prisma.notification.create({
      data: {
        userId: existingUser.id,
        type: 'INVITED_TO_ORG',
        title: "You've been invited",
        body: `You were invited to join ${membership.org.name}.`,
      },
    })
  }

  return Response.json({ ok: true }, { status: 201 })
}
