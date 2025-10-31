import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectParam = requestUrl.searchParams.get('redirect')
  const isNewUser = requestUrl.searchParams.get('new_user')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle errors silently
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // Handle errors silently
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if profile exists and if onboarding is completed
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed, created_at')
        .eq('id', user.id)
        .single()

      // Check if user has subscription intent from metadata
      const hasSubscriptionIntent = user.user_metadata?.intent_upgrade || redirectParam === '/subscription'

      // Determine if this is a new user
      const isNewlyCreatedUser = isNewUser === 'true' || 
        !profile || 
        (new Date().getTime() - new Date(profile.created_at || 0).getTime()) < 5000

      // If new user or onboarding not completed, redirect to onboarding
      if (isNewlyCreatedUser || !profile?.onboarding_completed) {
        // Preserve subscription intent through onboarding
        if (hasSubscriptionIntent) {
          return NextResponse.redirect(`${origin}/onboarding?redirect=/subscription`)
        }
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Existing user with completed onboarding
      // If they have subscription intent, redirect to subscription page
      if (hasSubscriptionIntent) {
        return NextResponse.redirect(`${origin}/subscription`)
      }

      // Default redirect to dashboard for returning users
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // No code - redirect to home
  return NextResponse.redirect(`${origin}/?error=no_token`)
}