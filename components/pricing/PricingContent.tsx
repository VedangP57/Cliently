'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const tiers = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'For freelancers just getting started',
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 19,
    annualPrice: 15,
    description: 'For growing freelancers',
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Agency',
    monthlyPrice: 49,
    annualPrice: 39,
    description: 'For teams and agencies',
    cta: 'Contact Sales',
    highlighted: false,
  },
]

type FeatureValue = boolean | string

interface ComparisonFeature {
  feature: string
  free: FeatureValue
  pro: FeatureValue
  agency: FeatureValue
}

const comparisonFeatures: ComparisonFeature[] = [
  { feature: 'Clients', free: 'Up to 3', pro: 'Unlimited', agency: 'Unlimited' },
  { feature: 'Projects', free: 'Up to 5', pro: 'Unlimited', agency: 'Unlimited' },
  { feature: 'Tasks (Kanban)', free: true, pro: true, agency: true },
  { feature: 'Time Tracking', free: 'Basic', pro: 'Advanced', agency: 'Advanced' },
  { feature: 'Timer Widget', free: true, pro: true, agency: true },
  { feature: 'Weekly Timesheet', free: false, pro: true, agency: true },
  { feature: 'Invoicing', free: 'Up to 5/mo', pro: 'Unlimited', agency: 'Unlimited' },
  { feature: 'PDF Export', free: true, pro: true, agency: true },
  { feature: 'Proposals', free: false, pro: true, agency: true },
  { feature: 'Contracts', free: false, pro: true, agency: true },
  { feature: 'Digital Signatures', free: false, pro: true, agency: true },
  { feature: 'Expense Tracking', free: false, pro: true, agency: true },
  { feature: 'Receipt Upload', free: false, pro: true, agency: true },
  { feature: 'Reports & Charts', free: 'Basic', pro: 'Full', agency: 'Full' },
  { feature: 'Calendar View', free: true, pro: true, agency: true },
  { feature: 'Custom Branding', free: false, pro: true, agency: true },
  { feature: 'Shareable Links', free: false, pro: true, agency: true },
  { feature: 'Team Members', free: '1', pro: '1', agency: 'Up to 10' },
  { feature: 'Client Portal', free: false, pro: false, agency: true },
  { feature: 'API Access', free: false, pro: false, agency: true },
  { feature: 'Priority Support', free: false, pro: true, agency: true },
  { feature: 'Dedicated Manager', free: false, pro: false, agency: true },
]

function FeatureCell({ value }: { value: FeatureValue }) {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckCircle2 className="h-4 w-4 text-primary mx-auto" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
    )
  }
  return <span className="text-sm">{value}</span>
}

export function PricingContent() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="space-y-16">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3">
        <Label
          htmlFor="billing-toggle"
          className={cn(
            'text-sm font-medium cursor-pointer',
            !annual && 'text-foreground',
            annual && 'text-muted-foreground'
          )}
        >
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={annual}
          onCheckedChange={setAnnual}
        />
        <Label
          htmlFor="billing-toggle"
          className={cn(
            'text-sm font-medium cursor-pointer',
            annual && 'text-foreground',
            !annual && 'text-muted-foreground'
          )}
        >
          Annual
        </Label>
        {annual && (
          <Badge variant="secondary" className="ml-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
            Save 20%
          </Badge>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const price = annual ? tier.annualPrice : tier.monthlyPrice
          return (
            <Card
              key={tier.name}
              className={cn(
                tier.highlighted
                  ? 'relative border-primary shadow-lg scale-[1.02]'
                  : 'border'
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${price}</span>
                    {price > 0 && (
                      <span className="text-muted-foreground">/mo</span>
                    )}
                  </div>
                  {annual && tier.monthlyPrice > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="line-through">
                        ${tier.monthlyPrice}/mo
                      </span>{' '}
                      &middot; Billed ${price * 12}/year
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>
                <div className="mt-auto">
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/signup">{tier.cta}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">
          Compare all features
        </h2>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Feature</TableHead>
                <TableHead className="text-center">Free</TableHead>
                <TableHead className="text-center bg-primary/5 font-semibold">
                  Pro
                </TableHead>
                <TableHead className="text-center">Agency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonFeatures.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium text-sm">
                    {row.feature}
                  </TableCell>
                  <TableCell className="text-center">
                    <FeatureCell value={row.free} />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <FeatureCell value={row.pro} />
                  </TableCell>
                  <TableCell className="text-center">
                    <FeatureCell value={row.agency} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
