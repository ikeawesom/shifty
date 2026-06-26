'use server'

import { syncUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { OrgRole } from '@prisma/client'
import OrgCreateForm from './OrgCreateForm'

async function createOrg(formData: FormData) {
  'use server'

  const user = await syncUser()
  const name = (formData.get('name') as string | null)?.trim()

  if (!name || name.length < 2) return

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const uniqueSlug = `${slug}-${Date.now().toString(36)}`

  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name, slug: uniqueSlug, ownerId: user.id },
    })
    await tx.orgMember.create({
      data: { userId: user.id, orgId: org.id, role: OrgRole.ADMIN },
    })
  })

  redirect('/dashboard')
}

export default async function NewOrgPage() {
  await syncUser()

  return (
    <main className="flex flex-col items-center justify-center flex-1 gap-8 p-8">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Create your organisation</h1>
          <p className="text-muted-foreground text-sm">
            You can add members and create shifts after setup.
          </p>
        </div>
        <OrgCreateForm action={createOrg} />
      </div>
    </main>
  )
}
