import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client that bypasses RLS (only created if service key is available)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export interface UserProfile {
    id: string
    email: string
    name: string
    role: "provider" | "client"
    created_at: string
    updated_at: string
}
  
export interface Task {
    id: string
    user_id: string
    title: string
    description: string
    priority: "high" | "medium" | "low"
    status: "pending" | "in_progress" | "completed"
    estimated_hours: number
    created_at: string
  }

export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  provider: {
    name: string
    email: string
    address?: string
    phone?: string
    website?: string
  }
  client: {
    name: string
    email: string
    address?: string
    company?: string
  }
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  subtotal: number
  tax?: {
    rate: number
    amount: number
  }
  total: number
  notes?: string
  payment_terms?: string
  status: "draft" | "sent" | "paid" | "overdue"
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  provider_id: string
  title: string
  bio?: string
  skills: string[]
  location?: string
  hourly_rate?: number
  rating: number  // Client-managed (not editable by provider)
  reviews_count: number  // Client-managed (not editable by provider)
  availability: string
  experience_years?: number
  education?: string
  certifications: string[]
  portfolio_links: string[]
  profile_image_url?: string
  is_verified: boolean
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  client_id: string
  title: string
  description: string
  category: string
  budget_min?: number
  budget_max?: number
  budget_type: 'hourly' | 'fixed' | 'range'
  skills_required: string[]
  experience_level?: 'beginner' | 'intermediate' | 'expert'
  project_duration?: string
  location_preference?: 'remote' | 'onsite' | 'hybrid'
  attachments?: string[]
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  is_featured: boolean
  views_count: number
  applications_count: number
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_id: string
  provider_id: string
  proposal: string
  proposed_rate?: number
  estimated_duration?: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

// Type for portfolio creation/editing (excludes client-managed fields)
export type PortfolioFormData = Omit<Portfolio, 'id' | 'provider_id' | 'rating' | 'reviews_count' | 'created_at' | 'updated_at'>;

// Type for job creation/editing (excludes auto-managed fields)
export type JobFormData = Omit<Job, 'id' | 'client_id' | 'views_count' | 'applications_count' | 'created_at' | 'updated_at'>;

// Type for job application creation
export type JobApplicationFormData = Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>;
