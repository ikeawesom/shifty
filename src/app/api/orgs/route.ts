import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { syncUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrgRole } from '@prisma/client'
import { PLAN_ORG_LIMITS } from '@/lib/plans'
import { ACTIVE_ORG_COOKIE } from '@/lib/org'

export async function POST(req: NextRequest) {
  const user = await syncUser()

  const body = (await req.json()) as { name?: string }
  const name = body.name?.trim()

  if (!name || name.length < 2 || name.length > 80) {
    return Response.json(
      { error: 'Organisation name must be 2–80 characters' },
      { status: 400 }
    )
  }

  const ownedOrgCount = await prisma.organization.count({
    where: { ownerId: user.id },
  })

  const limit = PLAN_ORG_LIMITS[user.plan]
  if (ownedOrgCount >= limit) {
    return Response.json(
      {
        error: `Organisation limit reached for your ${user.plan} plan`,
        upgradeRequired: true,
      },
      { status: 403 }
    )
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const uniqueSlug = `${slug}-${Date.now().toString(36)}`

  const org = await prisma.$transaction(async (tx) => {
    const newOrg = await tx.organization.create({
      data: { name, slug: uniqueSlug, ownerId: user.id },
    })
    await tx.orgMember.create({
      data: { userId: user.id, orgId: newOrg.id, role: OrgRole.ADMIN },
    })
    return newOrg
  })

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_ORG_COOKIE, org.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return Response.json(org, { status: 201 })
}
