import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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