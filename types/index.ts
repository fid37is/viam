// ==========================================
// FILE: types/index.ts
// ==========================================
// Application-specific types

export type ApplicationStatus = 
  | 'not_applied'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export interface CompanyInfo {
  size?: string
  industry?: string
  description?: string
  values?: string[]
  funding_stage?: string
  remote_policy?: string
  website?: string
  logo_url?: string
}

export interface MatchAnalysis {
  strengths: string[]
  concerns: string[]
  category_scores: {
    values_alignment: number
    culture_fit: number
    growth_opportunity: number
    practical_fit: number
  }
  interview_question: string
}

export interface InterviewDate {
  date: string
  type: 'phone-screen' | 'technical' | 'behavioral' | 'on-site' | 'final' | 'other'
  notes?: string
  interviewer?: string
}

export interface OfferDetails {
  salary?: number
  equity?: string
  benefits?: string[]
  start_date?: string
  deadline?: string
  notes?: string
}

export type CareerValue = 
  | 'mission-driven'
  | 'work-life-balance'
  | 'high-compensation'
  | 'career-growth'
  | 'innovation'
  | 'dei-commitment'
  | 'remote-work'
  | 'team-culture'
  | 'learning-opportunities'
  | 'impact'

export type DealBreaker = 
  | 'no-remote'
  | 'long-hours'
  | 'poor-dei'
  | 'unclear-mission'
  | 'low-growth'
  | 'micromanagement'
  | 'poor-reviews'

export interface UserPreferences {
  top_values: CareerValue[]
  deal_breakers: DealBreaker[]
  work_location_preference: 'remote' | 'hybrid' | 'office' | 'flexible'
  preferred_company_size?: ('startup' | 'scale-up' | 'enterprise')[]
  preferred_industries?: string[]
}
