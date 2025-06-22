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