import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrackedCtaLink } from '@/components/shared/TrackedCtaLink'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Users,
  FolderKanban,
  Clock,
  FileSpreadsheet,
  FileText,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Globe,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cliently — Freelance Business OS',
  description:
    'The all-in-one business OS for freelancers. Manage clients, projects, proposals, contracts, time tracking, expenses, and invoices from one dashboard.',
  openGraph: {
    title: 'Cliently — Freelance Business OS',
    description:
      'Manage your entire freelance business from one clean, polished dashboard.',
    images: ['/og-image.png'],
  },
}

const features = [
  {
    icon: Users,
    title: 'Client Management',
    description:
      'Track leads, organize contacts, and see lifetime value for every client in one place.',
  },
  {
    icon: FolderKanban,
    title: 'Project Tracking',
    description:
      'Plan, execute, and deliver projects on time with budgets, deadlines, and progress tracking.',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description:
      'Built-in timer and manual logging. Track billable hours per project and auto-add to invoices.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Invoicing',
    description:
      'Create professional invoices, pull from time logs and expenses, and share via unique links.',
  },
  {
    icon: FileText,
    title: 'Proposals & Contracts',
    description:
      'Write, send, and get proposals accepted and contracts signed — all with rich text editing.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description:
      'Revenue trends, hours breakdown, expense categories, and P&L — all in visual charts.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Sign up in seconds',
    description:
      'Create your free account with just an email and password. No credit card required.',
  },
  {
    number: '02',
    title: 'Add your clients & projects',
    description:
      'Import your client list, set up projects with budgets and deadlines, and start tracking.',
  },
  {
    number: '03',
    title: 'Invoice & get paid',
    description:
      'Generate professional invoices from tracked time and expenses. Share via link or PDF.',
  },
]

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'For freelancers just getting started',
    features: [
      'Up to 3 clients',
      'Up to 5 projects',
      'Basic time tracking',
      'Invoice generation',
      'Email support',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'For growing freelancers',
    features: [
      'Unlimited clients',
      'Unlimited projects',
      'Advanced time tracking',
      'Proposals & contracts',
      'Custom branding on invoices',
      'Expense tracking',
      'Reports & analytics',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '$49',
    period: '/mo',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Client portal access',
      'Advanced reporting',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Freelance Designer',
    content:
      'Cliently replaced 4 different tools I was using. Now I manage everything from one dashboard — clients, invoices, time tracking. It\'s been a game changer for my workflow.',
    rating: 5,
  },
  {
    name: 'James Rodriguez',
    role: 'Web Developer',
    content:
      'The proposal and contract features alone are worth it. I send professional proposals, get them signed digitally, and convert them to projects seamlessly.',
    rating: 5,
  },
  {
    name: 'Emily Chen',
    role: 'Marketing Consultant',
    content:
      'I was losing track of billable hours across multiple projects. The timer widget and automatic invoice generation have saved me hours every week.',
    rating: 5,
  },
]

const faqs = [
  {
    question: 'Is Cliently really free to start?',
    answer:
      'Yes! The Free plan includes up to 3 clients, 5 projects, basic time tracking, and invoice generation. No credit card required to sign up.',
  },
  {
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer:
      'Absolutely. You can switch between plans at any time. If you upgrade, you\'ll be charged the prorated difference. If you downgrade, the change takes effect at the end of your billing cycle.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Your data is stored securely on Supabase infrastructure with row-level security policies. Every user can only access their own data. We never share or sell your information.',
  },
  {
    question: 'Can my clients see their invoices and contracts?',
    answer:
      'Yes! You can generate unique shareable links for invoices, proposals, and contracts. Clients can view, accept proposals, sign contracts, and see invoice details without needing an account.',
  },
  {
    question: 'Does Cliently work on mobile?',
    answer:
      'Cliently is fully responsive and works great on phones and tablets. The dashboard has a dedicated mobile navigation for easy access to all features on the go.',
  },
  {
    question: 'Can I export my invoices as PDF?',
    answer:
      'Yes, every invoice can be downloaded as a professionally formatted PDF. The PDF includes your company branding, logo, and all line item details.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="container flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="h-3.5 w-3.5 text-primary" />
            The all-in-one freelance business OS
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Run your freelance business{' '}
            <span className="text-primary">like a pro</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Clients, projects, proposals, contracts, time tracking, expenses,
            and invoices — all from one clean dashboard. Stop juggling tools
            and start growing your business.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedCtaLink href="/signup">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 min-w-[180px] transition-colors"
                style={{ backgroundColor: '#5e5cc5', color: '#ffffff' }}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </TrackedCtaLink>
            <Button size="lg" variant="outline" asChild className="min-w-[180px]">
              <Link href="#features">See Features</Link>
            </Button>
          </div>
          <div className="mt-12 w-full max-w-5xl">
            <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground">
                  cliently.app/dashboard
                </div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dashboard Preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 scroll-mt-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage your business
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Six powerful modules working together so you can focus on what
              you do best — your craft.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border bg-card transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to transform how you run your business.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-24 scroll-mt-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={
                  tier.highlighted
                    ? 'relative border-primary shadow-lg scale-[1.02]'
                    : 'border'
                }
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
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.period && (
                        <span className="text-muted-foreground">
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  </div>
                  <ul className="mb-6 space-y-3 flex-1">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <TrackedCtaLink href="/signup">{tier.cta}</TrackedCtaLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by freelancers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hear from people who transformed their workflow with Cliently.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-24 scroll-mt-16">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Got questions? We&apos;ve got answers.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 sm:py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10 mb-6">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to streamline your freelance business?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Join thousands of freelancers who manage their entire business from
            one platform. Free to start, no credit card required.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <TrackedCtaLink href="/signup">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 min-w-[180px] transition-colors"
                style={{ backgroundColor: '#ffffff', color: '#18181b' }}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </TrackedCtaLink>
            <Link href="/pricing">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 min-w-[180px] border transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#ffffff', backgroundColor: 'transparent' }}
              >
                View Pricing
              </button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Secure & private
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Set up in minutes
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
