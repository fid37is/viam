
// ==========================================
// FILE: app/auth/callback/route.ts
// ==========================================
// Handle OAuth and email verification callback

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/login?error=authentication_failed', requestUrl.origin))
      }

      // Check if user has completed onboarding
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single()

        // If new user (no profile or onboarding not completed), redirect to onboarding
        if (!profile || !profile.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        }
      }

      // Existing user or onboarding complete - go to dashboard
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(new URL('/login?error=unexpected_error', requestUrl.origin))
    }
  }

  // No code present - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
