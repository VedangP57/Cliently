'use client'

import Link from 'next/link'
import posthog from 'posthog-js'

interface TrackedCtaLinkProps {
  href: string
  children: React.ReactNode
}

export function TrackedCtaLink({ href, children }: TrackedCtaLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => {
        posthog.capture('cta_clicked', { href })
      }}
    >
      {children}
    </Link>
  )
}
