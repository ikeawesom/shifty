import { RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PLAN_MEMBER_LIMITS,
  PLAN_ASSIGNEE_LIMITS,
  PLAN_ORG_LIMITS,
} from '@/lib/plans'

function fmt(n: number) {
  return n === Infinity ? '∞' : String(n)
}

const CTA_CLASS =
  'inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors'

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground">Start free. Scale as your team grows.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48">Feature</TableHead>
            <TableHead>Free</TableHead>
            <TableHead>Starter</TableHead>
            <TableHead>Pro</TableHead>
            <TableHead>Enterprise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium text-muted-foreground">Price</TableCell>
            <TableCell className="font-semibold">Free</TableCell>
            <TableCell className="text-muted-foreground">Contact us</TableCell>
            <TableCell className="text-muted-foreground">Contact us</TableCell>
            <TableCell className="text-muted-foreground">Contact us</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-muted-foreground">Organizations</TableCell>
            <TableCell>{fmt(PLAN_ORG_LIMITS.FREE)}</TableCell>
            <TableCell>{fmt(PLAN_ORG_LIMITS.STARTER)}</TableCell>
            <TableCell>{fmt(PLAN_ORG_LIMITS.PRO)}</TableCell>
            <TableCell>{fmt(PLAN_ORG_LIMITS.ENTERPRISE)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-muted-foreground">Members / org</TableCell>
            <TableCell>{fmt(PLAN_MEMBER_LIMITS.FREE)}</TableCell>
            <TableCell>{fmt(PLAN_MEMBER_LIMITS.STARTER)}</TableCell>
            <TableCell>{fmt(PLAN_MEMBER_LIMITS.PRO)}</TableCell>
            <TableCell>{fmt(PLAN_MEMBER_LIMITS.ENTERPRISE)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-muted-foreground">Assignees / shift</TableCell>
            <TableCell>{fmt(PLAN_ASSIGNEE_LIMITS.FREE)}</TableCell>
            <TableCell>{fmt(PLAN_ASSIGNEE_LIMITS.STARTER)}</TableCell>
            <TableCell>{fmt(PLAN_ASSIGNEE_LIMITS.PRO)}</TableCell>
            <TableCell>{fmt(PLAN_ASSIGNEE_LIMITS.ENTERPRISE)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium text-muted-foreground">Email reminders</TableCell>
            <TableCell className="text-muted-foreground">None</TableCell>
            <TableCell>Daily summary</TableCell>
            <TableCell>Daily + Personal</TableCell>
            <TableCell>Daily + Personal + Pre-shift</TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell>
              <RegisterLink className={CTA_CLASS}>Get started free</RegisterLink>
            </TableCell>
            <TableCell>
              <RegisterLink className={CTA_CLASS}>Get started</RegisterLink>
            </TableCell>
            <TableCell>
              <RegisterLink className={CTA_CLASS}>Get started</RegisterLink>
            </TableCell>
            <TableCell>
              <RegisterLink className={CTA_CLASS}>Get started</RegisterLink>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
