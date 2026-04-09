'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { acceptProposalAction } from '@/lib/actions/proposals'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AcceptProposalButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const router = useRouter()

  async function handleAccept() {
    setLoading(true)
    const result = await acceptProposalAction(slug)
    setLoading(false)
    if (!result.error) {
      setAccepted(true)
      router.refresh()
    }
  }

  if (accepted) {
    return (
      <div className="flex items-center justify-center gap-2 text-green-600">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Proposal Accepted</span>
      </div>
    )
  }

  return (
    <Button size="lg" onClick={handleAccept} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Accept Proposal
    </Button>
  )
}
