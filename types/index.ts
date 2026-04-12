export type UserRole = 'user' | 'admin'

export type ClientStatus = 'active' | 'inactive' | 'lead' | 'archived'
export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled'
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'expired'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type ExpenseCategory = 'software' | 'hardware' | 'travel' | 'marketing' | 'meals' | 'other'
export type InvoiceItemType = 'service' | 'time' | 'expense'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  company_name: string | null
  company_logo: string | null
  address: string | null
  tax_rate: number
  payment_terms: string
  invoice_notes: string | null
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  website: string | null
  address: string | null
  status: ClientStatus
  notes: string | null
  tags: string[]
  total_earned: number
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  client_id: string | null
  title: string
  description: string | null
  status: ProjectStatus
  deadline: string | null
  budget: number | null
  notes: string | null
  created_at: string
  client?: Client
}

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  position: number
  created_at: string
  project?: Project
}

export interface Proposal {
  id: string
  user_id: string
  client_id: string | null
  title: string
  content: string | null
  status: ProposalStatus
  valid_until: string | null
  total_amount: number | null
  slug: string | null
  created_at: string
  client?: Client
}

export interface Contract {
  id: string
  user_id: string
  project_id: string | null
  client_id: string | null
  title: string
  content: string | null
  status: ContractStatus
  signed_at: string | null
  signed_name: string | null
  slug: string | null
  created_at: string
  client?: Client
  project?: Project
}

export interface TimeLog {
  id: string
  user_id: string
  project_id: string | null
  task_id: string | null
  description: string | null
  hours: number
  date: string
  billable: boolean
  invoiced: boolean
  created_at: string
  project?: Project
  task?: Task
}

export interface Expense {
  id: string
  user_id: string
  project_id: string | null
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  receipt_url: string | null
  billable: boolean
  invoiced: boolean
  created_at: string
  project?: Project
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string | null
  project_id: string | null
  invoice_number: string | null
  status: InvoiceStatus
  issue_date: string | null
  due_date: string | null
  tax_rate: number
  discount: number
  notes: string | null
  paid_at: string | null
  slug: string | null
  created_at: string
  client?: Client
  project?: Project
  invoice_items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  rate: number
  amount: number
  type: InvoiceItemType
}

export interface OnboardingProgress {
  id: string
  user_id: string
  has_completed_profile: boolean
  has_added_client: boolean
  has_created_project: boolean
  has_logged_time: boolean
  has_created_invoice: boolean
  completed_at: string | null
  created_at: string
}
