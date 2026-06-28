'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronsUpDownIcon, CheckIcon, PlusIcon } from 'lucide-react'
import { switchOrg } from '@/lib/org-actions'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface OrgSwitcherProps {
  orgs: { id: string; name: string }[]
  activeOrgId: string
  activeOrgName: string
  atOrgLimit: boolean
}

export default function OrgSwitcher({
  orgs,
  activeOrgId,
  activeOrgName,
  atOrgLimit,
}: OrgSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSwitch(orgId: string) {
    if (orgId === activeOrgId) return
    startTransition(async () => {
      await switchOrg(orgId)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="max-w-[160px] truncate">{activeOrgName}</span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organisations</DropdownMenuLabel>
          {orgs.map((org) => (
            <DropdownMenuItem key={org.id} onClick={() => handleSwitch(org.id)}>
              <CheckIcon
                className="size-4 shrink-0"
                style={{ opacity: org.id === activeOrgId ? 1 : 0 }}
              />
              <span className="truncate">{org.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {atOrgLimit ? (
          <DropdownMenuItem disabled>
            <PlusIcon className="size-4 shrink-0" />
            New org
            <span className="ml-auto text-xs text-muted-foreground">Upgrade to add more</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem render={<Link href="/org/new" />}>
            <PlusIcon className="size-4 shrink-0" />
            New org
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
