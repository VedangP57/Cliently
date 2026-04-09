import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/invoices/InvoicePDF'
import { NextResponse } from 'next/server'
import { createElement } from 'react'
import type { Invoice, InvoiceItem, Profile, Client } from '@/types'

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json()
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [invoiceRes, profileRes] = await Promise.all([
      supabase
        .from('invoices')
        .select('*, invoice_items(*), client:clients(*)')
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
    ])

    if (!invoiceRes.data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const invoice = invoiceRes.data as Invoice
    const items = (invoice.invoice_items ?? []) as InvoiceItem[]
    const profile = (profileRes.data ?? {}) as Profile
    const client = (invoice.client ?? null) as Client | null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(InvoicePDF as any, { invoice, items, profile, client })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any)

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number || 'invoice'}.pdf"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PDF generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
