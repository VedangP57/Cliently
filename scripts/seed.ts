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
  const { error } = await supabase.from(table).insert(rows)
  if (error) {
    console.error(`✗ Failed to seed ${table}:`, error.message)
    process.exit(1)
  }
  console.log(`✓ Seeded ${table} (${rows.length})`)
}

// ── IDs (pre-generated for cross-referencing) ───────────────────────────

const clientIds = Array.from({ length: 5 }, () => crypto.randomUUID())
const projectIds = Array.from({ length: 8 }, () => crypto.randomUUID())
const taskIds = Array.from({ length: 20 }, () => crypto.randomUUID())
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
  const clients = [
    {
      id: clientIds[0],
      user_id: userId,
      name: 'Stellar Dynamics',
      email: 'hello@stellardynamics.io',
      phone: '(503) 555-0142',
      company: 'Stellar Dynamics Inc.',
      website: 'https://stellardynamics.io',
      address: '1200 NW Marshall St, Portland, OR 97209',
      status: 'active',
      notes: 'Long-term client, prefers async communication via email.',
      tags: ['tech', 'saas', 'priority'],
      total_earned: 18500,
    },
    {
      id: clientIds[1],
      user_id: userId,
      name: 'Bloom & Branch Co.',
      email: 'sarah@bloomandbranch.com',
      phone: '(971) 555-0198',
      company: 'Bloom & Branch Co.',
      website: 'https://bloomandbranch.com',
      address: '845 SE Hawthorne Blvd, Portland, OR 97214',
      status: 'active',
      notes: 'Boutique retail brand. Very design-conscious, values aesthetics.',
      tags: ['retail', 'design', 'recurring'],
      total_earned: 12300,
    },
    {
      id: clientIds[2],
      user_id: userId,
      name: 'Neon Pixel Labs',
      email: 'dev@neonpixel.dev',
      phone: '(415) 555-0267',
      company: 'Neon Pixel Labs LLC',
      website: 'https://neonpixel.dev',
      address: '560 Mission St, San Francisco, CA 94105',
      status: 'lead',
      notes: 'Referred by Stellar Dynamics. Interested in mobile app development.',
      tags: ['tech', 'startup', 'referral'],
      total_earned: 0,
    },
    {
      id: clientIds[3],
      user_id: userId,
      name: 'Coastal Living Magazine',
      email: 'editor@coastalliving.com',
      phone: '(310) 555-0384',
      company: 'Coastal Media Group',
      website: 'https://coastalliving.com',
      address: '2100 Ocean Ave, Santa Monica, CA 90405',
      status: 'inactive',
      notes: 'Completed their website project. May return for annual updates.',
      tags: ['media', 'publishing'],
      total_earned: 8700,
    },
    {
      id: clientIds[4],
      user_id: userId,
      name: 'Redwood Ventures',
      email: 'partnerships@redwoodvc.com',
      phone: '(650) 555-0412',
      company: 'Redwood Ventures Capital',
      website: 'https://redwoodvc.com',
      address: '3000 Sand Hill Road, Menlo Park, CA 94025',
      status: 'active',
      notes: 'VC firm needing portfolio company branding support.',
      tags: ['finance', 'branding', 'high-value'],
      total_earned: 22000,
    },
  ]
  await insert('clients', clients)

  // 4. Projects
  const projects = [
    {
      id: projectIds[0],
      user_id: userId,
      client_id: clientIds[0],
      title: 'Brand Identity Redesign',
      description: 'Complete brand overhaul including logo, color palette, typography, and brand guidelines document.',
      status: 'completed',
      deadline: daysAgo(10),
      budget: 12000,
      notes: 'Client approved final deliverables on time.',
    },
    {
      id: projectIds[1],
      user_id: userId,
      client_id: clientIds[0],
      title: 'E-commerce Platform',
      description: 'Build a full-featured e-commerce platform with inventory management, payment processing, and analytics dashboard.',
      status: 'in_progress',
      deadline: daysFromNow(30),
      budget: 25000,
      notes: 'Using Next.js + Stripe. Phase 2 includes mobile app.',
    },
    {
      id: projectIds[2],
      user_id: userId,
      client_id: clientIds[1],
      title: 'Mobile App MVP',
      description: 'React Native app for their loyalty program. iOS and Android, push notifications, QR scanning.',
      status: 'in_progress',
      deadline: daysFromNow(45),
      budget: 18000,
      notes: 'Design approved. Development in progress.',
    },
    {
      id: projectIds[3],
      user_id: userId,
      client_id: clientIds[1],
      title: 'Content Strategy',
      description: 'Develop a 6-month content calendar, blog posts, and social media strategy.',
      status: 'planning',
      deadline: daysFromNow(60),
      budget: 5000,
      notes: 'Kickoff meeting scheduled next week.',
    },
    {
      id: projectIds[4],
      user_id: userId,
      client_id: clientIds[3],
      title: 'Website Redesign',
      description: 'Modern responsive redesign of their magazine website with improved article layout and subscription flow.',
      status: 'completed',
      deadline: daysAgo(30),
      budget: 15000,
      notes: 'Successfully launched. Client very satisfied.',
    },
    {
      id: projectIds[5],
      user_id: userId,
      client_id: clientIds[4],
      title: 'SEO Optimization',
      description: 'Technical SEO audit, on-page optimization, and backlink strategy for portfolio company websites.',
      status: 'review',
      deadline: daysFromNow(7),
      budget: 4500,
      notes: 'Audit complete, implementing recommendations.',
    },
    {
      id: projectIds[6],
      user_id: userId,
      client_id: clientIds[4],
      title: 'Social Media Campaign',
      description: 'Q2 social media campaign across LinkedIn, Twitter, and Instagram for brand awareness.',
      status: 'on_hold',
      deadline: daysFromNow(20),
      budget: 3500,
      notes: 'Paused pending budget approval from their board.',
    },
    {
      id: projectIds[7],
      user_id: userId,
      client_id: clientIds[1],
      title: 'Product Photography',
      description: 'Professional product photography for new spring collection. 50 products, lifestyle and studio shots.',
      status: 'planning',
      deadline: daysFromNow(14),
      budget: 2500,
      notes: 'Studio booked for next month.',
    },
  ]
  await insert('projects', projects)

  // 5. Tasks
  const tasks = [
    // Brand Identity Redesign (completed project) — all done
    { id: taskIds[0], user_id: userId, project_id: projectIds[0], title: 'Research competitor branding', status: 'done', priority: 'high', due_date: daysAgo(40), position: 0 },
    { id: taskIds[1], user_id: userId, project_id: projectIds[0], title: 'Create mood board', status: 'done', priority: 'medium', due_date: daysAgo(35), position: 1 },
    { id: taskIds[2], user_id: userId, project_id: projectIds[0], title: 'Design logo concepts', status: 'done', priority: 'high', due_date: daysAgo(25), position: 2 },

    // E-commerce Platform — mixed
    { id: taskIds[3], user_id: userId, project_id: projectIds[1], title: 'Design homepage wireframes', status: 'done', priority: 'high', due_date: daysAgo(5), position: 0 },
    { id: taskIds[4], user_id: userId, project_id: projectIds[1], title: 'Set up CI/CD pipeline', status: 'done', priority: 'medium', due_date: daysAgo(3), position: 1 },
    { id: taskIds[5], user_id: userId, project_id: projectIds[1], title: 'Implement product catalog', status: 'in_progress', priority: 'high', due_date: daysFromNow(5), position: 2 },
    { id: taskIds[6], user_id: userId, project_id: projectIds[1], title: 'Integrate Stripe payments', status: 'in_progress', priority: 'urgent', due_date: daysFromNow(10), position: 3 },
    { id: taskIds[7], user_id: userId, project_id: projectIds[1], title: 'Build admin dashboard', status: 'todo', priority: 'medium', due_date: daysFromNow(20), position: 4 },
    { id: taskIds[8], user_id: userId, project_id: projectIds[1], title: 'Write API documentation', status: 'todo', priority: 'low', due_date: daysFromNow(25), position: 5 },

    // Mobile App MVP — mixed
    { id: taskIds[9], user_id: userId, project_id: projectIds[2], title: 'Set up React Native project', status: 'done', priority: 'high', due_date: daysAgo(7), position: 0 },
    { id: taskIds[10], user_id: userId, project_id: projectIds[2], title: 'Design onboarding flow', status: 'in_progress', priority: 'high', due_date: daysFromNow(3), position: 1 },
    { id: taskIds[11], user_id: userId, project_id: projectIds[2], title: 'Implement QR scanner', status: 'todo', priority: 'medium', due_date: daysFromNow(15), position: 2 },
    { id: taskIds[12], user_id: userId, project_id: projectIds[2], title: 'Push notification integration', status: 'todo', priority: 'medium', due_date: daysFromNow(25), position: 3 },

    // Content Strategy — planning
    { id: taskIds[13], user_id: userId, project_id: projectIds[3], title: 'Audit existing content', status: 'todo', priority: 'high', due_date: daysFromNow(7), position: 0 },
    { id: taskIds[14], user_id: userId, project_id: projectIds[3], title: 'Create editorial calendar', status: 'todo', priority: 'medium', due_date: daysFromNow(14), position: 1 },

    // SEO Optimization — review
    { id: taskIds[15], user_id: userId, project_id: projectIds[5], title: 'Run technical SEO audit', status: 'done', priority: 'high', due_date: daysAgo(3), position: 0 },
    { id: taskIds[16], user_id: userId, project_id: projectIds[5], title: 'Fix meta tags and schema markup', status: 'in_review', priority: 'high', due_date: daysFromNow(2), position: 1 },
    { id: taskIds[17], user_id: userId, project_id: projectIds[5], title: 'Optimize page load speed', status: 'in_review', priority: 'medium', due_date: daysFromNow(5), position: 2 },

    // Social Media Campaign
    { id: taskIds[18], user_id: userId, project_id: projectIds[6], title: 'Draft campaign brief', status: 'done', priority: 'high', due_date: daysAgo(2), position: 0 },
    { id: taskIds[19], user_id: userId, project_id: projectIds[6], title: 'Design social media templates', status: 'in_progress', priority: 'medium', due_date: daysFromNow(8), position: 1 },
  ]
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
