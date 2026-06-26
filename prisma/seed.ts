import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const leader = await prisma.user.upsert({
    where: { email: 'leader@shifty.dev' },
    update: {},
    create: {
      kindeId: 'seed_leader_001',
      email: 'leader@shifty.dev',
      name: 'Alice Leader',
      platformRole: 'ORG_LEADER',
      plan: 'PRO',
    },
  })

  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      ownerId: leader.id,
    },
  })

  await prisma.orgMember.upsert({
    where: { userId_orgId: { userId: leader.id, orgId: org.id } },
    update: {},
    create: {
      userId: leader.id,
      orgId: org.id,
      role: 'ADMIN',
    },
  })

  const member = await prisma.user.upsert({
    where: { email: 'member@shifty.dev' },
    update: {},
    create: {
      kindeId: 'seed_member_001',
      email: 'member@shifty.dev',
      name: 'Bob Member',
      platformRole: 'MEMBER',
      plan: 'FREE',
    },
  })

  await prisma.orgMember.upsert({
    where: { userId_orgId: { userId: member.id, orgId: org.id } },
    update: {},
    create: {
      userId: member.id,
      orgId: org.id,
      role: 'MEMBER',
    },
  })

  console.log('Seed complete:', { leader: leader.email, member: member.email, org: org.slug })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
