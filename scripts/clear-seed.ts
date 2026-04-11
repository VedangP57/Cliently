import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()

async function clearSeed() {
  console.log('\n🗑  Clearing seed data for demo@cliently.com...\n')

  // Find the demo user
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('✗ Failed to list users:', listError.message)
    process.exit(1)
  }

  const demoUser = users.users.find((u) => u.email === 'demo@cliently.com')
  if (!demoUser) {
    console.log('⚠ No user found with email demo@cliently.com — nothing to clear.')
    process.exit(0)
  }

  const userId = demoUser.id
  console.log(`Found user: ${userId}`)

  // Delete in reverse FK order
  // invoice_items must be deleted via invoice IDs first
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id')
    .eq('user_id', userId)

  if (invoices && invoices.length > 0) {
    const invoiceIds = invoices.map((i) => i.id)
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .in('invoice_id', invoiceIds)
    if (error) {
      console.error('✗ Failed to delete invoice_items:', error.message)
      process.exit(1)
    }
    console.log(`✓ Deleted invoice_items`)
  }

  const tables = [
    'invoices',
    'expenses',
    'time_logs',
    'contracts',
    'proposals',
    'tasks',
    'projects',
    'clients',
  ]

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) {
      console.error(`✗ Failed to delete ${table}:`, error.message)
      process.exit(1)
    }
    console.log(`✓ Deleted ${table}`)
  }

  // Delete profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
  if (profileError) {
    console.error('✗ Failed to delete profile:', profileError.message)
    process.exit(1)
  }
  console.log('✓ Deleted profile')

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  if (authError) {
    console.error('✗ Failed to delete auth user:', authError.message)
    process.exit(1)
  }
  console.log('✓ Deleted auth user')

  console.log('\n✅ Seed data cleared!\n')
}

clearSeed().catch((err) => {
  console.error('Clear failed:', err)
  process.exit(1)
})
