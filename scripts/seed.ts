import { createAdminClient } from '@/lib/supabase/admin'
import { generateSlug } from '@/lib/utils'
import dayjs from 'dayjs'

const supabase = createAdminClient()

// ── Helpers ─────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  return dayjs().subtract(n, 'day').format('YYYY-MM-DD')
}
function daysFromNow(n: number) {
  return dayjs().add(n, 'day').format('YYYY-MM-DD')
}

function tiptap(blocks: string[]): string {
  return JSON.stringify({
    type: 'doc',
    content: blocks.map((text) => ({
      type: 'paragraph',
      content: text ? [{ type: 'text', text }] : [],
    })),
  })
}

async function insert(table: string, rows: Record<string, unknown>[]) {
  const chunkSize = 100
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from(table).insert(chunk)
    if (error) {
      console.error(`✗ Failed to seed ${table}:`, error.message)
      process.exit(1)
    }
  }
  console.log(`✓ Seeded ${table} (${rows.length})`)
}

// ── Seed volume ─────────────────────────────────────────────────────────

const CLIENT_COUNT = 100
const PROJECT_COUNT = 150
const TASK_COUNT = 400

const CLIENT_STATUSES = ['active', 'inactive', 'lead', 'archived'] as const
const PROJECT_STATUSES = ['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'] as const
const TASK_STATUSES = ['todo', 'in_progress', 'in_review', 'done'] as const
const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

const INDUSTRIES = ['tech', 'retail', 'healthcare', 'finance', 'media', 'legal', 'education', 'food', 'sports', 'saas']
const CITIES = [
  { city: 'Portland', state: 'OR', zip: '97201' },
  { city: 'Seattle', state: 'WA', zip: '98101' },
  { city: 'San Francisco', state: 'CA', zip: '94105' },
  { city: 'Austin', state: 'TX', zip: '78701' },
  { city: 'Denver', state: 'CO', zip: '80202' },
  { city: 'Chicago', state: 'IL', zip: '60606' },
  { city: 'Boston', state: 'MA', zip: '02115' },
  { city: 'New York', state: 'NY', zip: '10001' },
  { city: 'Los Angeles', state: 'CA', zip: '90001' },
  { city: 'Miami', state: 'FL', zip: '33101' },
]
const NAME_PREFIXES = ['North', 'Blue', 'Summit', 'Prime', 'Atlas', 'Nova', 'Peak', 'River', 'Urban', 'Clear', 'Bright', 'Silver']
const NAME_SUFFIXES = ['Labs', 'Studio', 'Group', 'Partners', 'Collective', 'Systems', 'Media', 'Works', 'Co.', 'Ventures', 'Digital', 'Solutions']
const PROJECT_TITLES = [
  'Website Redesign',
  'Mobile App MVP',
  'Brand Identity Refresh',
  'SEO Optimization',
  'Content Strategy',
  'E-commerce Platform',
  'Social Media Campaign',
  'Product Photography',
  'Analytics Dashboard',
  'Client Portal',
  'Marketing Automation',
  'Annual Retainer',
]
const TASK_TITLES = [
  'Kickoff meeting',
  'Requirements gathering',
  'Wireframe review',
  'Design iteration',
  'Development sprint',
  'QA testing',
  'Client feedback round',
  'Launch checklist',
  'Documentation update',
  'Performance optimization',
]

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function generateClients(userId: string, ids: string[]) {
  return ids.map((id, index) => {
    const prefix = NAME_PREFIXES[index % NAME_PREFIXES.length]
    const suffix = NAME_SUFFIXES[Math.floor(index / NAME_PREFIXES.length) % NAME_SUFFIXES.length]
    const name = `${prefix} ${suffix}`
    const company = `${name} ${index + 1}`
    const slug = slugify(company)
    const location = CITIES[index % CITIES.length]
    const industry = INDUSTRIES[index % INDUSTRIES.length]
    const status = CLIENT_STATUSES[index % CLIENT_STATUSES.length]

    return {
      id,
      user_id: userId,
      name: company,
      email: `hello@${slug}.com`,
      phone: `(${200 + (index % 800)}) 555-${String(1000 + index).slice(-4)}`,
      company,
      website: `https://${slug}.com`,
      address: `${100 + index} Main St, ${location.city}, ${location.state} ${location.zip}`,
      status,
      notes: `Seeded client in ${industry}. Account #${index + 1}.`,
      tags: [industry, index % 2 === 0 ? 'recurring' : 'project'],
      total_earned: status === 'lead' ? 0 : (index % 17) * 1250,
    }
  })
}

function generateProjects(userId: string, ids: string[], clientIds: string[]) {
  return ids.map((id, index) => {
    const clientId = clientIds[index % clientIds.length]
    const title = `${PROJECT_TITLES[index % PROJECT_TITLES.length]} ${Math.floor(index / PROJECT_TITLES.length) + 1}`
    const status = PROJECT_STATUSES[index % PROJECT_STATUSES.length]
    const deadlineOffset = status === 'completed' ? -((index % 30) + 5) : (index % 60) + 7

    return {
      id,
      user_id: userId,
      client_id: clientId,
      title,
      description: `${title} for client engagement #${(index % clientIds.length) + 1}.`,
      status,
      deadline: deadlineOffset < 0 ? daysAgo(Math.abs(deadlineOffset)) : daysFromNow(deadlineOffset),
      budget: 2500 + (index % 20) * 750,
      notes: `Auto-generated project record #${index + 1}.`,
    }
  })
}

function generateTasks(userId: string, ids: string[], projectIds: string[]) {
  return ids.map((id, index) => {
    const projectId = index < ids.length - 5 ? projectIds[index % projectIds.length] : null
    const status = TASK_STATUSES[index % TASK_STATUSES.length]
    const dueOffset = status === 'done' ? -((index % 20) + 1) : (index % 25) + 1

    return {
      id,
      user_id: userId,
      project_id: projectId,
      title: `${TASK_TITLES[index % TASK_TITLES.length]} #${index + 1}`,
      status,
      priority: TASK_PRIORITIES[index % TASK_PRIORITIES.length],
      due_date: dueOffset < 0 ? daysAgo(Math.abs(dueOffset)) : daysFromNow(dueOffset),
      position: index % 8,
    }
  })
}

// ── IDs (pre-generated for cross-referencing) ───────────────────────────

const clientIds = Array.from({ length: CLIENT_COUNT }, () => crypto.randomUUID())
const projectIds = Array.from({ length: PROJECT_COUNT }, () => crypto.randomUUID())
const taskIds = Array.from({ length: TASK_COUNT }, () => crypto.randomUUID())
const proposalIds = Array.from({ length: 3 }, () => crypto.randomUUID())
const contractIds = Array.from({ length: 2 }, () => crypto.randomUUID())
const invoiceIds = Array.from({ length: 8 }, () => crypto.randomUUID())

// ── Main ────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 Starting seed...\n')

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'demo@cliently.com',
    password: 'Demo@1234',
    email_confirm: true,
    user_metadata: { full_name: 'Alex Morgan' },
  })
  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('⚠ User demo@cliently.com already exists — run seed:clear first')
      process.exit(1)
    }
    console.error('✗ Failed to create user:', authError.message)
    process.exit(1)
  }
  const userId = authData.user.id
  console.log(`✓ Created auth user (${userId})`)

  // 2. Update profile (auto-created by trigger)
  // Small delay to let the trigger fire
  await new Promise((r) => setTimeout(r, 1000))
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: 'Alex Morgan',
      company_name: 'Morgan Creative Studio',
      role: 'user',
      address: '742 Evergreen Terrace, Portland, OR 97201',
      tax_rate: 10,
      payment_terms: 'Net 30',
      invoice_notes: 'Thank you for your business! Payment is due within 30 days.',
    })
    .eq('id', userId)
  if (profileError) {
    console.error('✗ Failed to update profile:', profileError.message)
    process.exit(1)
  }
  console.log('✓ Updated profile')

  // 3. Clients
  const clients = generateClients(userId, clientIds)
  await insert('clients', clients)

  // 4. Projects
  const projects = generateProjects(userId, projectIds, clientIds)
  await insert('projects', projects)

  // 5. Tasks
  const tasks = generateTasks(userId, taskIds, projectIds)
  await insert('tasks', tasks)

  // 6. Proposals
  const proposals = [
    {
      id: proposalIds[0],
      user_id: userId,
      client_id: clientIds[2],
      title: 'Mobile App Development Proposal',
      status: 'draft',
      valid_until: daysFromNow(30),
      total_amount: 22000,
      slug: generateSlug('mobile-app-development-proposal'),
      content: tiptap([
        'Mobile App Development Proposal',
        '',
        'Prepared for: Neon Pixel Labs',
        'Prepared by: Morgan Creative Studio',
        '',
        'Project Overview',
        'We propose to design and develop a cross-platform mobile application using React Native, targeting both iOS and Android platforms. The app will include user authentication, real-time data syncing, push notifications, and offline capability.',
        '',
        'Scope of Work',
        '• Discovery & requirements gathering (1 week)',
        '• UX research and wireframing (2 weeks)',
        '• Visual design and prototyping (2 weeks)',
        '• Frontend development (4 weeks)',
        '• Backend API integration (2 weeks)',
        '• QA testing and bug fixes (2 weeks)',
        '• App store submission and launch support (1 week)',
        '',
        'Timeline: 14 weeks',
        '',
        'Investment',
        'Total project cost: $22,000',
        '• 50% upfront deposit: $11,000',
        '• 25% at design approval: $5,500',
        '• 25% at launch: $5,500',
        '',
        'This proposal is valid for 30 days from the date of issue.',
      ]),
    },
    {
      id: proposalIds[1],
      user_id: userId,
      client_id: clientIds[4],
      title: 'SEO & Digital Marketing Proposal',
      status: 'sent',
      valid_until: daysFromNow(21),
      total_amount: 8500,
      slug: generateSlug('seo-digital-marketing-proposal'),
      content: tiptap([
        'SEO & Digital Marketing Proposal',
        '',
        'Prepared for: Redwood Ventures',
        'Prepared by: Morgan Creative Studio',
        '',
        'Executive Summary',
        'We will implement a comprehensive SEO and digital marketing strategy to increase organic traffic by 40% and improve search rankings for key portfolio company websites within 6 months.',
        '',
        'Services Included',
        '• Technical SEO audit and implementation',
        '• Keyword research and content optimization',
        '• Backlink building strategy',
        '• Monthly performance reporting',
        '• Google Analytics and Search Console setup',
        '',
        'Timeline: 6 months (ongoing)',
        '',
        'Pricing',
        'Monthly retainer: $1,400/month',
        'Total 6-month engagement: $8,500 (includes setup discount)',
        '',
        'Payment Terms: Net 30, invoiced monthly.',
      ]),
    },
    {
      id: proposalIds[2],
      user_id: userId,
      client_id: clientIds[0],
      title: 'E-commerce Platform Proposal',
      status: 'accepted',
      valid_until: daysAgo(5),
      total_amount: 25000,
      slug: generateSlug('ecommerce-platform-proposal'),
      content: tiptap([
        'E-commerce Platform Development Proposal',
        '',
        'Prepared for: Stellar Dynamics',
        'Prepared by: Morgan Creative Studio',
        '',
        'Project Summary',
        'Full-stack e-commerce platform built with Next.js, featuring product management, Stripe payment integration, inventory tracking, and a comprehensive analytics dashboard.',
        '',
        'Deliverables',
        '• Responsive storefront with product catalog',
        '• Shopping cart and checkout flow',
        '• Stripe payment integration (cards, Apple Pay, Google Pay)',
        '• Admin panel for inventory and order management',
        '• Customer accounts with order history',
        '• Analytics dashboard with sales reports',
        '',
        'Timeline: 10 weeks',
        '',
        'Investment: $25,000',
        'Payment schedule:',
        '• 30% upfront: $7,500',
        '• 30% at midpoint: $7,500',
        '• 40% at delivery: $10,000',
      ]),
    },
  ]
  await insert('proposals', proposals)

  // 7. Contracts
  const contracts = [
    {
      id: contractIds[0],
      user_id: userId,
      project_id: projectIds[1],
      client_id: clientIds[0],
      title: 'E-commerce Platform Development Agreement',
      status: 'signed',
      signed_at: dayjs().subtract(20, 'day').toISOString(),
      signed_name: 'James Chen',
      slug: generateSlug('ecommerce-development-agreement'),
      content: tiptap([
        'SERVICE AGREEMENT',
        '',
        'This Service Agreement ("Agreement") is entered into between Morgan Creative Studio ("Service Provider") and Stellar Dynamics Inc. ("Client").',
        '',
        '1. SCOPE OF WORK',
        'The Service Provider agrees to design, develop, and deliver a full-featured e-commerce platform as outlined in the accepted proposal dated March 15, 2026.',
        '',
        '2. TIMELINE',
        'The project shall be completed within 10 weeks from the date of signing, with milestones as outlined in the project plan.',
        '',
        '3. COMPENSATION',
        'Total project fee: $25,000 USD, payable in three installments as outlined in the proposal.',
        '',
        '4. INTELLECTUAL PROPERTY',
        'Upon full payment, all intellectual property rights in the deliverables shall transfer to the Client.',
        '',
        '5. CONFIDENTIALITY',
        'Both parties agree to maintain confidentiality of proprietary information shared during the course of this project.',
        '',
        '6. TERMINATION',
        'Either party may terminate this agreement with 14 days written notice. Client shall pay for all work completed up to the termination date.',
        '',
        '7. LIABILITY',
        'Service Provider liability shall not exceed the total fees paid under this agreement.',
        '',
        'Agreed and accepted by both parties.',
      ]),
    },
    {
      id: contractIds[1],
      user_id: userId,
      project_id: projectIds[2],
      client_id: clientIds[1],
      title: 'Mobile App Development Contract',
      status: 'sent',
      slug: generateSlug('mobile-app-development-contract'),
      content: tiptap([
        'MOBILE APPLICATION DEVELOPMENT AGREEMENT',
        '',
        'This Agreement is made between Morgan Creative Studio ("Developer") and Bloom & Branch Co. ("Client").',
        '',
        '1. PROJECT DESCRIPTION',
        'Developer will create a cross-platform mobile application for the Client\'s loyalty program, supporting iOS and Android.',
        '',
        '2. DELIVERABLES',
        '• Mobile application (iOS and Android)',
        '• Backend API endpoints',
        '• Admin dashboard for loyalty program management',
        '• User documentation',
        '',
        '3. TIMELINE AND MILESTONES',
        'Total duration: 12 weeks',
        '• Weeks 1-3: Design and prototyping',
        '• Weeks 4-9: Development',
        '• Weeks 10-11: Testing',
        '• Week 12: Launch and deployment',
        '',
        '4. FEES',
        'Total: $18,000 USD',
        '• 50% upon signing: $9,000',
        '• 50% upon delivery: $9,000',
        '',
        '5. REVISIONS',
        'Up to 3 rounds of design revisions are included. Additional revisions billed at $150/hour.',
        '',
        'Please sign below to accept these terms.',
      ]),
    },
  ]
  await insert('contracts', contracts)

  // 8. Time Logs
  const timeLogs = [
    { user_id: userId, project_id: projectIds[0], task_id: taskIds[0], description: 'Competitor analysis research', hours: 3, date: daysAgo(45), billable: true, invoiced: true },
    { user_id: userId, project_id: projectIds[0], task_id: taskIds[1], description: 'Mood board creation and client review', hours: 2.5, date: daysAgo(38), billable: true, invoiced: true },
    { user_id: userId, project_id: projectIds[0], task_id: taskIds[2], description: 'Logo design iterations', hours: 5, date: daysAgo(28), billable: true, invoiced: true },
    { user_id: userId, project_id: projectIds[1], task_id: taskIds[3], description: 'Homepage wireframe design', hours: 4, date: daysAgo(8), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[1], task_id: taskIds[4], description: 'CI/CD pipeline setup with GitHub Actions', hours: 2, date: daysAgo(6), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[1], task_id: taskIds[5], description: 'Product catalog component development', hours: 6, date: daysAgo(2), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[1], task_id: taskIds[5], description: 'Product catalog API integration', hours: 3.5, date: daysAgo(1), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[2], task_id: taskIds[9], description: 'React Native project scaffolding', hours: 1.5, date: daysAgo(10), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[2], task_id: taskIds[10], description: 'Onboarding flow wireframes', hours: 3, date: daysAgo(4), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[4], description: 'Website redesign final QA', hours: 4, date: daysAgo(32), billable: true, invoiced: true },
    { user_id: userId, project_id: projectIds[5], task_id: taskIds[15], description: 'Technical SEO audit with Screaming Frog', hours: 2.5, date: daysAgo(5), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[5], task_id: taskIds[16], description: 'Meta tag optimization', hours: 1.5, date: daysAgo(3), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[6], task_id: taskIds[18], description: 'Campaign brief writing', hours: 2, date: daysAgo(4), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[1], description: 'Team standup and planning', hours: 0.5, date: daysAgo(1), billable: false, invoiced: false },
    { user_id: userId, project_id: projectIds[2], description: 'Client feedback call', hours: 1, date: daysAgo(3), billable: false, invoiced: false },
  ]
  await insert('time_logs', timeLogs)

  // 9. Expenses
  const expenses = [
    { user_id: userId, project_id: projectIds[1], title: 'Stripe Atlas incorporation fee', amount: 500, category: 'software', date: daysAgo(20), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[1], title: 'AWS hosting (monthly)', amount: 89, category: 'software', date: daysAgo(15), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[2], title: 'Apple Developer Program', amount: 99, category: 'software', date: daysAgo(12), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[0], title: 'Stock photography license', amount: 250, category: 'software', date: daysAgo(35), billable: true, invoiced: true },
    { user_id: userId, project_id: projectIds[4], title: 'Client dinner meeting', amount: 185, category: 'meals', date: daysAgo(33), billable: false, invoiced: false },
    { user_id: userId, project_id: projectIds[5], title: 'Ahrefs SEO tool subscription', amount: 99, category: 'software', date: daysAgo(8), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[7], title: 'Studio lighting equipment', amount: 450, category: 'hardware', date: daysAgo(5), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[6], title: 'Facebook Ads budget', amount: 300, category: 'marketing', date: daysAgo(3), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[3], title: 'Travel to client office', amount: 78, category: 'travel', date: daysAgo(2), billable: true, invoiced: false },
    { user_id: userId, project_id: projectIds[1], title: 'External monitor for development', amount: 349, category: 'hardware', date: daysAgo(18), billable: false, invoiced: false },
  ]
  await insert('expenses', expenses)

  // 10. Invoices
  const invoices = [
    // Paid
    {
      id: invoiceIds[0],
      user_id: userId,
      client_id: clientIds[0],
      project_id: projectIds[0],
      invoice_number: 'INV-2026-001',
      status: 'paid',
      issue_date: daysAgo(45),
      due_date: daysAgo(15),
      tax_rate: 10,
      discount: 0,
      notes: 'Brand Identity Redesign — Final payment',
      paid_at: dayjs().subtract(18, 'day').toISOString(),
      slug: generateSlug('inv-2026-001'),
    },
    {
      id: invoiceIds[1],
      user_id: userId,
      client_id: clientIds[3],
      project_id: projectIds[4],
      invoice_number: 'INV-2026-002',
      status: 'paid',
      issue_date: daysAgo(35),
      due_date: daysAgo(5),
      tax_rate: 10,
      discount: 500,
      notes: 'Website Redesign — Project completion',
      paid_at: dayjs().subtract(8, 'day').toISOString(),
      slug: generateSlug('inv-2026-002'),
    },
    // Sent
    {
      id: invoiceIds[2],
      user_id: userId,
      client_id: clientIds[0],
      project_id: projectIds[1],
      invoice_number: 'INV-2026-003',
      status: 'sent',
      issue_date: daysAgo(10),
      due_date: daysFromNow(20),
      tax_rate: 10,
      discount: 0,
      notes: 'E-commerce Platform — Phase 1 milestone',
      slug: generateSlug('inv-2026-003'),
    },
    {
      id: invoiceIds[3],
      user_id: userId,
      client_id: clientIds[1],
      project_id: projectIds[2],
      invoice_number: 'INV-2026-004',
      status: 'sent',
      issue_date: daysAgo(5),
      due_date: daysFromNow(25),
      tax_rate: 10,
      discount: 0,
      notes: 'Mobile App MVP — Upfront deposit',
      slug: generateSlug('inv-2026-004'),
    },
    // Draft
    {
      id: invoiceIds[4],
      user_id: userId,
      client_id: clientIds[4],
      project_id: projectIds[5],
      invoice_number: 'INV-2026-005',
      status: 'draft',
      issue_date: dayjs().format('YYYY-MM-DD'),
      due_date: daysFromNow(30),
      tax_rate: 10,
      discount: 0,
      notes: 'SEO Optimization — Audit and implementation',
    },
    {
      id: invoiceIds[5],
      user_id: userId,
      client_id: clientIds[4],
      project_id: projectIds[6],
      invoice_number: 'INV-2026-006',
      status: 'draft',
      issue_date: dayjs().format('YYYY-MM-DD'),
      due_date: daysFromNow(30),
      tax_rate: 10,
      discount: 0,
      notes: 'Social Media Campaign — Q2 retainer',
    },
    // Overdue
    {
      id: invoiceIds[6],
      user_id: userId,
      client_id: clientIds[1],
      project_id: projectIds[7],
      invoice_number: 'INV-2026-007',
      status: 'overdue',
      issue_date: daysAgo(40),
      due_date: daysAgo(10),
      tax_rate: 10,
      discount: 0,
      notes: 'Product Photography — Deposit',
      slug: generateSlug('inv-2026-007'),
    },
    // Cancelled
    {
      id: invoiceIds[7],
      user_id: userId,
      client_id: clientIds[2],
      invoice_number: 'INV-2026-008',
      status: 'cancelled',
      issue_date: daysAgo(25),
      due_date: daysAgo(5),
      tax_rate: 0,
      discount: 0,
      notes: 'Cancelled — client postponed project',
    },
  ]
  await insert('invoices', invoices)

  // 11. Invoice Items
  const invoiceItems = [
    // INV-001 (Brand Identity — paid)
    { invoice_id: invoiceIds[0], description: 'Logo design and brand identity', quantity: 1, rate: 5000, amount: 5000, type: 'service' },
    { invoice_id: invoiceIds[0], description: 'Brand guidelines document', quantity: 1, rate: 2500, amount: 2500, type: 'service' },
    { invoice_id: invoiceIds[0], description: 'Design consultation hours', quantity: 10.5, rate: 150, amount: 1575, type: 'time' },
    { invoice_id: invoiceIds[0], description: 'Stock photography licenses', quantity: 1, rate: 250, amount: 250, type: 'expense' },

    // INV-002 (Website Redesign — paid)
    { invoice_id: invoiceIds[1], description: 'Website design and development', quantity: 1, rate: 10000, amount: 10000, type: 'service' },
    { invoice_id: invoiceIds[1], description: 'Content migration', quantity: 1, rate: 2000, amount: 2000, type: 'service' },
    { invoice_id: invoiceIds[1], description: 'QA testing and launch support', quantity: 4, rate: 150, amount: 600, type: 'time' },

    // INV-003 (E-commerce Phase 1 — sent)
    { invoice_id: invoiceIds[2], description: 'E-commerce platform — Phase 1 development', quantity: 1, rate: 7500, amount: 7500, type: 'service' },
    { invoice_id: invoiceIds[2], description: 'Frontend development hours', quantity: 15.5, rate: 150, amount: 2325, type: 'time' },
    { invoice_id: invoiceIds[2], description: 'AWS hosting setup', quantity: 1, rate: 89, amount: 89, type: 'expense' },
    { invoice_id: invoiceIds[2], description: 'Stripe integration setup', quantity: 1, rate: 500, amount: 500, type: 'expense' },

    // INV-004 (Mobile App deposit — sent)
    { invoice_id: invoiceIds[3], description: 'Mobile App MVP — Upfront deposit (50%)', quantity: 1, rate: 9000, amount: 9000, type: 'service' },
    { invoice_id: invoiceIds[3], description: 'React Native project setup', quantity: 1.5, rate: 150, amount: 225, type: 'time' },
    { invoice_id: invoiceIds[3], description: 'Apple Developer Program fee', quantity: 1, rate: 99, amount: 99, type: 'expense' },

    // INV-005 (SEO — draft)
    { invoice_id: invoiceIds[4], description: 'Technical SEO audit', quantity: 1, rate: 2000, amount: 2000, type: 'service' },
    { invoice_id: invoiceIds[4], description: 'On-page optimization', quantity: 1, rate: 1500, amount: 1500, type: 'service' },
    { invoice_id: invoiceIds[4], description: 'SEO consulting hours', quantity: 4, rate: 150, amount: 600, type: 'time' },
    { invoice_id: invoiceIds[4], description: 'Ahrefs subscription', quantity: 1, rate: 99, amount: 99, type: 'expense' },

    // INV-006 (Social Media — draft)
    { invoice_id: invoiceIds[5], description: 'Social media strategy development', quantity: 1, rate: 1500, amount: 1500, type: 'service' },
    { invoice_id: invoiceIds[5], description: 'Content creation (10 posts)', quantity: 10, rate: 100, amount: 1000, type: 'service' },
    { invoice_id: invoiceIds[5], description: 'Ad spend management fee', quantity: 1, rate: 500, amount: 500, type: 'service' },

    // INV-007 (Photography deposit — overdue)
    { invoice_id: invoiceIds[6], description: 'Product photography — Session deposit', quantity: 1, rate: 1250, amount: 1250, type: 'service' },
    { invoice_id: invoiceIds[6], description: 'Studio lighting equipment rental', quantity: 1, rate: 450, amount: 450, type: 'expense' },
    { invoice_id: invoiceIds[6], description: 'Pre-production planning', quantity: 2, rate: 150, amount: 300, type: 'time' },

    // INV-008 (Cancelled)
    { invoice_id: invoiceIds[7], description: 'Initial consultation', quantity: 2, rate: 150, amount: 300, type: 'time' },
    { invoice_id: invoiceIds[7], description: 'Requirements gathering', quantity: 1, rate: 500, amount: 500, type: 'service' },
    { invoice_id: invoiceIds[7], description: 'Technical scoping document', quantity: 1, rate: 750, amount: 750, type: 'service' },
  ]
  await insert('invoice_items', invoiceItems)

  console.log('\n✅ Seed complete! Login with demo@cliently.com / Demo@1234\n')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
