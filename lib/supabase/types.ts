// ==========================================
// FILE: lib/supabase/types.ts
// ==========================================
// Database types generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          email: string | null
          career_goals: string | null
          short_term_goal: string | null
          long_term_goal: string | null
          top_values: Json
          deal_breakers: Json
          preferred_company_size: string[] | null
          preferred_industries: string[] | null
          work_location_preference: string | null
          management_style_preference: string | null
          profile_completed: boolean
          onboarding_completed: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email?: string | null
          career_goals?: string | null
          short_term_goal?: string | null
          long_term_goal?: string | null
          top_values?: Json
          deal_breakers?: Json
          preferred_company_size?: string[] | null
          preferred_industries?: string[] | null
          work_location_preference?: string | null
          management_style_preference?: string | null
          profile_completed?: boolean
          onboarding_completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email?: string | null
          career_goals?: string | null
          short_term_goal?: string | null
          long_term_goal?: string | null
          top_values?: Json
          deal_breakers?: Json
          preferred_company_size?: string[] | null
          preferred_industries?: string[] | null
          work_location_preference?: string | null
          management_style_preference?: string | null
          profile_completed?: boolean
          onboarding_completed?: boolean
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          job_url: string
          job_title: string
          company_name: string
          company_website: string | null
          location: string | null
          job_description: string | null
          key_requirements: string[] | null
          status: string
          applied_date: string | null
          company_info: Json
          match_score: number | null
          match_analysis: Json
          notes: string | null
          user_interest_level: number | null
          last_follow_up: string | null
          next_follow_up_reminder: string | null
          interview_dates: Json
          offer_details: Json
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          job_url: string
          job_title: string
          company_name: string
          company_website?: string | null
          location?: string | null
          job_description?: string | null
          key_requirements?: string[] | null
          status?: string
          applied_date?: string | null
          company_info?: Json
          match_score?: number | null
          match_analysis?: Json
          notes?: string | null
          user_interest_level?: number | null
          last_follow_up?: string | null
          next_follow_up_reminder?: string | null
          interview_dates?: Json
          offer_details?: Json
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          job_url?: string
          job_title?: string
          company_name?: string
          company_website?: string | null
          location?: string | null
          job_description?: string | null
          key_requirements?: string[] | null
          status?: string
          applied_date?: string | null
          company_info?: Json
          match_score?: number | null
          match_analysis?: Json
          notes?: string | null
          user_interest_level?: number | null
          last_follow_up?: string | null
          next_follow_up_reminder?: string | null
          interview_dates?: Json
          offer_details?: Json
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          application_id: string | null
          created_at: string
          activity_type: string
          details: Json
        }
        Insert: {
          id?: string
          user_id: string
          application_id?: string | null
          created_at?: string
          activity_type: string
          details?: Json
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string | null
          created_at?: string
          activity_type?: string
          details?: Json
        }
      }
    }
  }
}

// Helper types for better type inference
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']

export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertApplication = Database['public']['Tables']['applications']['Insert']
export type InsertActivityLog = Database['public']['Tables']['activity_log']['Insert']

export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateApplication = Database['public']['Tables']['applications']['Update']
