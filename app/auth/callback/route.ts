import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
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

      // If profile doesn't exist or was just created (within last 5 seconds), redirect to onboarding
      if (!profile || !profile.onboarding_completed) {
        const isNewUser = !profile || 
          (new Date().getTime() - new Date(profile.created_at || 0).getTime()) < 5000

        if (isNewUser || !profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
    }

    // Existing user with completed onboarding - redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  // No code - redirect to home
  return NextResponse.redirect(`${origin}/?error=no_token`)
}