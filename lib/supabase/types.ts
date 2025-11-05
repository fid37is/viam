export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type InterviewQuestion = {
  id: string
  category: string
  question: string
  tips: string[]
  sample_answer?: string
}

export type InterviewPrep = {
  questions: InterviewQuestion[]
  key_topics: string[]
  preparation_tips: string[]
  company_insights: string[]
  generated_at: string
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_type: string
          application_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          application_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          application_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_date: string | null
          company_id: string | null
          company_info: Json | null
          company_name: string
          company_website: string | null
          created_at: string | null
          id: string
          interview_dates: Json | null
          interview_prep_enabled: boolean | null
          interview_prep_generated_at: string | null
          interview_prep_notes: string | null
          interview_questions: Json | null
          job_description: string | null
          job_title: string
          job_url: string
          key_requirements: string[] | null
          last_follow_up: string | null
          location: string | null
          match_analysis: Json | null
          match_score: number | null
          next_follow_up_reminder: string | null
          notes: string | null
          offer_details: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
          user_interest_level: number | null
        }
        Insert: {
          applied_date?: string | null
          company_id?: string | null
          company_info?: Json | null
          company_name: string
          company_website?: string | null
          created_at?: string | null
          id?: string
          interview_dates?: Json | null
          interview_prep_enabled?: boolean | null
          interview_prep_generated_at?: string | null
          interview_prep_notes?: string | null
          interview_questions?: Json | null
          job_description?: string | null
          job_title: string
          job_url: string
          key_requirements?: string[] | null
          last_follow_up?: string | null
          location?: string | null
          match_analysis?: Json | null
          match_score?: number | null
          next_follow_up_reminder?: string | null
          notes?: string | null
          offer_details?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          user_interest_level?: number | null
        }
        Update: {
          applied_date?: string | null
          company_id?: string | null
          company_info?: Json | null
          company_name?: string
          company_website?: string | null
          created_at?: string | null
          id?: string
          interview_dates?: Json | null
          interview_prep_enabled?: boolean | null
          interview_prep_generated_at?: string | null
          interview_prep_notes?: string | null
          interview_questions?: Json | null
          job_description?: string | null
          job_title?: string
          job_url?: string
          key_requirements?: string[] | null
          last_follow_up?: string | null
          location?: string | null
          match_analysis?: Json | null
          match_score?: number | null
          next_follow_up_reminder?: string | null
          notes?: string | null
          offer_details?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          user_interest_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          company_size: string | null
          cons: Json | null
          created_at: string | null
          culture_summary: string | null
          description: string | null
          founded_year: number | null
          glassdoor_url: string | null
          headquarters: string | null
          id: string
          industry: string | null
          last_researched_at: string | null
          linkedin_url: string | null
          logo_url: string | null
          name: string
          overall_rating: number | null
          pros: Json | null
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company_size?: string | null
          cons?: Json | null
          created_at?: string | null
          culture_summary?: string | null
          description?: string | null
          founded_year?: number | null
          glassdoor_url?: string | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          last_researched_at?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          name: string
          overall_rating?: number | null
          pros?: Json | null
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company_size?: string | null
          cons?: Json | null
          created_at?: string | null
          culture_summary?: string | null
          description?: string | null
          founded_year?: number | null
          glassdoor_url?: string | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          last_researched_at?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          name?: string
          overall_rating?: number | null
          pros?: Json | null
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      deletion_log: {
        Row: {
          id: string
          user_id: string
          application_id: string
          deleted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          application_id: string
          deleted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string
          deleted_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deletion_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          invoice_pdf: string | null
          period_end: string
          period_start: string
          status: string
          stripe_invoice_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          invoice_pdf?: string | null
          period_end: string
          period_start: string
          status: string
          stripe_invoice_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          invoice_pdf?: string | null
          period_end?: string
          period_start?: string
          status?: string
          stripe_invoice_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          brand: string
          created_at: string | null
          exp_month: number
          exp_year: number
          id: string
          is_default: boolean | null
          last4: string
          stripe_payment_method_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand: string
          created_at?: string | null
          exp_month: number
          exp_year: number
          id?: string
          is_default?: boolean | null
          last4: string
          stripe_payment_method_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string | null
          exp_month?: number
          exp_year?: number
          id?: string
          is_default?: boolean | null
          last4?: string
          stripe_payment_method_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          career_goals: string | null
          created_at: string | null
          deal_breakers: Json | null
          email: string | null
          full_name: string | null
          id: string
          long_term_goal: string | null
          management_style_preference: string | null
          onboarding_completed: boolean | null
          preferred_company_size: string[] | null
          preferred_industries: string[] | null
          profile_completed: boolean | null
          short_term_goal: string | null
          top_values: Json | null
          updated_at: string | null
          work_location_preference: string | null
          account_status: 'active' | 'hibernated' | 'deleted'
          deletion_scheduled_at: string | null
          subscription_tier: string | null
          is_admin: boolean | null 
        }
        Insert: {
          career_goals?: string | null
          created_at?: string | null
          deal_breakers?: Json | null
          email?: string | null
          full_name?: string | null
          id: string
          long_term_goal?: string | null
          management_style_preference?: string | null
          onboarding_completed?: boolean | null
          preferred_company_size?: string[] | null
          preferred_industries?: string[] | null
          profile_completed?: boolean | null
          short_term_goal?: string | null
          top_values?: Json | null
          updated_at?: string | null
          work_location_preference?: string | null
          account_status?: 'active' | 'hibernated' | 'deleted'
          deletion_scheduled_at?: string | null
          is_admin?: boolean | null
        }
        Update: {
          career_goals?: string | null
          created_at?: string | null
          deal_breakers?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          long_term_goal?: string | null
          management_style_preference?: string | null
          onboarding_completed?: boolean | null
          preferred_company_size?: string[] | null
          preferred_industries?: string[] | null
          profile_completed?: boolean | null
          short_term_goal?: string | null
          top_values?: Json | null
          updated_at?: string | null
          work_location_preference?: string | null
          account_status?: 'active' | 'hibernated' | 'deleted'
          deletion_scheduled_at?: string | null
          is_admin?: boolean | null 
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          billing_cycle?: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          billing_cycle?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          billing_cycle?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_company: {
        Args: { p_name: string; p_website?: string }
        Returns: string
      }
      email_exists: {
        Args: {
          p_email: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// Helper type exports
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']
export type DeletionLog = Database['public']['Tables']['deletion_log']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']

// Billing cycle type
export type BillingCycle = 'monthly' | 'yearly'
export type SubscriptionTier = 'free' | 'premium'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

// Subscription with typed fields
export type SubscriptionWithTypes = Omit<Subscription, 'tier' | 'billing_cycle' | 'status'> & {
  tier: SubscriptionTier
  billing_cycle: BillingCycle | null
  status: SubscriptionStatus
}

// Checkout session request type
export type CheckoutSessionRequest = {
  userId: string
  email: string
  priceId: string
  billingCycle: BillingCycle
}

// Price configuration type
export type PriceConfig = {
  monthlyPriceId: string
  yearlyPriceId: string
}

// Stripe webhook event metadata
export type StripeSubscriptionMetadata = {
  userId: string
  billingCycle?: BillingCycle
}