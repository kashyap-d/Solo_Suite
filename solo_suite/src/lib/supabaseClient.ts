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

// Type for portfolio creation/editing (excludes client-managed fields)
export type PortfolioFormData = Omit<Portfolio, 'id' | 'provider_id' | 'rating' | 'reviews_count' | 'created_at' | 'updated_at'>;
