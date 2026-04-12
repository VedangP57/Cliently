import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()

const ADMIN_EMAIL = 'admin@cliently.com'
const ADMIN_PASSWORD = 'Admin@1234'
const ADMIN_NAME = 'System Admin'

async function seedAdmin() {
  console.log('\n🔐 Seeding admin user...\n')

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_NAME },
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      // User exists — just ensure they have admin role
      console.log('⚠ User already exists, updating role to admin...')
      const { data: users } = await supabase.auth.admin.listUsers()
      const existing = users?.users.find((u) => u.email === ADMIN_EMAIL)
      if (!existing) {
        console.error('✗ Could not find existing user')
        process.exit(1)
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', full_name: ADMIN_NAME })
        .eq('id', existing.id)

      if (updateError) {
        console.error('✗ Failed to update profile:', updateError.message)
        process.exit(1)
      }

      console.log('✓ Updated existing user to admin role')
      console.log(`\n✅ Admin ready!\n   Email:    ${ADMIN_EMAIL}\n   Password: ${ADMIN_PASSWORD}\n`)
      return
    }

    console.error('✗ Failed to create user:', authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log(`✓ Created auth user (${userId})`)

  // 2. Wait for profile trigger, then update with admin role
  await new Promise((r) => setTimeout(r, 1000))

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: ADMIN_NAME,
      role: 'admin',
    })
    .eq('id', userId)

  if (profileError) {
    console.error('✗ Failed to update profile:', profileError.message)
    process.exit(1)
  }
  console.log('✓ Set profile role to admin')

  console.log(`\n✅ Admin seeded!\n   Email:    ${ADMIN_EMAIL}\n   Password: ${ADMIN_PASSWORD}\n`)
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
