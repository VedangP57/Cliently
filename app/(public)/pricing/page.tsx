import type { Metadata } from 'next'
import { PricingContent } from '@/components/pricing/PricingContent'

export const metadata: Metadata = {
  title: 'Pricing — Cliently',
  description:
    'Simple, transparent pricing for freelancers. Start free, upgrade when you are ready.',
  openGraph: {
    title: 'Pricing — Cliently',
    description:
      'Simple, transparent pricing for freelancers. Start free, upgrade when you are ready.',
    images: ['/og-image.png'],
  },
}

export default function PricingPage() {
  return (
    <div className="py-20 sm:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Plans for every stage of your freelance journey
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade as you grow. All plans include a 14-day free
            trial of Pro features.
          </p>
        </div>
        <PricingContent />
      </div>
    </div>
  )
}
