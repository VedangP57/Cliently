import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Invoice, InvoiceItem, Profile, Client } from '@/types'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  companyName: { fontSize: 18, fontWeight: 'bold' },
  companyAddress: { fontSize: 9, color: '#666', marginTop: 4 },
  invoiceTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
  invoiceNumber: { fontSize: 10, color: '#666', textAlign: 'right', marginTop: 2 },
  statusBadge: { fontSize: 9, textTransform: 'uppercase', marginTop: 4, textAlign: 'right', color: '#555' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  gridCol: { flex: 1 },
  label: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: 4 },
  value: { fontSize: 10, lineHeight: 1.4 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 6, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  colDesc: { flex: 3 },
  colQty: { flex: 0.7, textAlign: 'right' },
  colRate: { flex: 1, textAlign: 'right' },
  colAmount: { flex: 1, textAlign: 'right' },
  thText: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', color: '#888' },
  totalsContainer: { marginTop: 12, alignItems: 'flex-end' },
  totalsRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { color: '#666' },
  totalDivider: { width: 200, borderBottomWidth: 1, borderBottomColor: '#333', marginVertical: 4 },
  totalBold: { fontWeight: 'bold', fontSize: 12 },
  footer: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  footerLabel: { fontWeight: 'bold', fontSize: 9 },
  footerText: { fontSize: 9, color: '#666', marginTop: 2, lineHeight: 1.4 },
})

function formatMoney(n: number) {
  return `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

interface InvoicePDFProps {
  invoice: Invoice
  items: InvoiceItem[]
  profile: Profile
  client: Client | null
}

export function InvoicePDF({ invoice, items, profile, client }: InvoicePDFProps) {
  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const taxAmount = subtotal * ((invoice.tax_rate ?? 0) / 100)
  const total = subtotal + taxAmount - (invoice.discount ?? 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{profile.company_name ?? profile.full_name ?? 'Business'}</Text>
            {profile.address && <Text style={styles.companyAddress}>{profile.address}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <Text style={styles.statusBadge}>{invoice.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Client + Dates */}
        <View style={styles.grid}>
          <View style={styles.gridCol}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.value}>{client?.name ?? '—'}</Text>
            {client?.email && <Text style={styles.value}>{client.email}</Text>}
            {client?.address && <Text style={styles.value}>{client.address}</Text>}
          </View>
          <View style={[styles.gridCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.label}>Invoice Details</Text>
            <Text style={styles.value}>Issue: {invoice.issue_date ?? '—'}</Text>
            <Text style={styles.value}>Due: {invoice.due_date ?? '—'}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colDesc]}>Description</Text>
          <Text style={[styles.thText, styles.colQty]}>Qty</Text>
          <Text style={[styles.thText, styles.colRate]}>Rate</Text>
          <Text style={[styles.thText, styles.colAmount]}>Amount</Text>
        </View>
        {items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colRate}>{formatMoney(item.rate)}</Text>
            <Text style={styles.colAmount}>{formatMoney(item.amount)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text>{formatMoney(subtotal)}</Text>
          </View>
          {(invoice.tax_rate ?? 0) > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
              <Text>{formatMoney(taxAmount)}</Text>
            </View>
          )}
          {(invoice.discount ?? 0) > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text>-{formatMoney(invoice.discount)}</Text>
            </View>
          )}
          <View style={styles.totalDivider} />
          <View style={styles.totalsRow}>
            <Text style={styles.totalBold}>Total</Text>
            <Text style={styles.totalBold}>{formatMoney(total)}</Text>
          </View>
        </View>

        {/* Footer */}
        {(profile.payment_terms || invoice.notes || profile.invoice_notes) && (
          <View style={styles.footer}>
            {profile.payment_terms && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.footerLabel}>Payment Terms</Text>
                <Text style={styles.footerText}>{profile.payment_terms}</Text>
              </View>
            )}
            {invoice.notes && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.footerLabel}>Notes</Text>
                <Text style={styles.footerText}>{invoice.notes}</Text>
              </View>
            )}
            {profile.invoice_notes && <Text style={styles.footerText}>{profile.invoice_notes}</Text>}
          </View>
        )}
      </Page>
    </Document>
  )
}
