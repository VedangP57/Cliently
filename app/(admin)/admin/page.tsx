import { PageHeader } from '@/components/shared/PageHeader'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function AdminOverviewPage() {
  const admin = createAdminClient()

  const [usersRes, clientsCountRes, paidInvoicesRes] = await Promise.all([
    admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
    admin.from('clients').select('id', { count: 'exact', head: true }),
    admin.from('invoices').select('invoice_items(amount)').eq('status', 'paid'),
  ])

  const totalUsers = usersRes.data?.users.length ?? 0
  const totalClients = clientsCountRes.count ?? 0
  const totalRevenue =
    (paidInvoicesRes.data ?? []).reduce((invoiceTotal, invoice) => {
      const itemTotal = ((invoice.invoice_items as Array<{ amount: number }> | null) ?? []).reduce(
        (sum, item) => sum + Number(item.amount),
        0
      )
      return invoiceTotal + itemTotal
    }, 0) ?? 0

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" description="Platform-level statistics." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Revenue Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
