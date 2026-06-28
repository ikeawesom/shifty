'use client'

import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Menu, Zap } from 'lucide-react'
import Link from 'next/link'
import { SidebarNav } from './SidebarNav'
import OrgSwitcher from '@/components/org/OrgSwitcher'
import ProfileMenu from './ProfileMenu'

interface MobileSidebarProps {
  isLeader: boolean
  isOrgAdmin: boolean
  orgs: { id: string; name: string }[]
  activeOrgId: string
  activeOrgName: string
  atOrgLimit: boolean
  userName: string | null
  userEmail: string
  kindeUserId: string
}

export default function MobileSidebar({
  isLeader,
  isOrgAdmin,
  orgs,
  activeOrgId,
  activeOrgName,
  atOrgLimit,
  userName,
  userEmail,
  kindeUserId,
}: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80vw] p-0 flex flex-col">
        <div className="h-14 flex items-center px-6 border-b border-border/60 shrink-0">
          <Link href="/dashboard" className="font-bold text-sm text-primary flex items-center gap-1.5">
            <Zap className="size-4" />
            Shifty
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <SidebarNav isLeader={isLeader} isOrgAdmin={isOrgAdmin} />
        </nav>
        <div className="border-t border-border/60 px-3 py-3 space-y-1 shrink-0">
          {orgs.length > 0 && (
            <OrgSwitcher
              orgs={orgs}
              activeOrgId={activeOrgId}
              activeOrgName={activeOrgName}
              atOrgLimit={atOrgLimit}
            />
          )}
          <ProfileMenu userName={userName} userEmail={userEmail} kindeUserId={kindeUserId} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
