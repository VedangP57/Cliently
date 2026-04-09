'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { signContractAction } from '@/lib/actions/contracts'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SignContractWidgetProps {
  slug: string
}

export function SignContractWidget({ slug }: SignContractWidgetProps) {
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [signed, setSigned] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSign() {
    setError(null)
    setLoading(true)
    const result = await signContractAction(slug, name)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSigned(true)
      router.refresh()
    }
  }

  if (signed) {
    return (
      <div className="flex flex-col items-center gap-2 text-green-600">
        <CheckCircle2 className="h-8 w-8" />
        <span className="text-lg font-semibold">Contract Signed</span>
        <p className="text-sm text-muted-foreground">Thank you for signing this contract.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sign this contract</h3>

      <div className="space-y-2">
        <Label htmlFor="signed-name">Full Name</Label>
        <Input
          id="signed-name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="agree-terms"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked === true)}
        />
        <Label htmlFor="agree-terms" className="text-sm leading-relaxed cursor-pointer">
          I, {name || '[your name]'}, agree to the terms above
        </Label>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        size="lg"
        onClick={handleSign}
        disabled={loading || !name.trim() || !agreed}
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign Contract
      </Button>
    </div>
  )
}
