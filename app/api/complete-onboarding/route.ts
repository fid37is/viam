// ==========================================
// FILE: app/api/complete-onboarding/route.ts (NEW)
// ==========================================
// Mark onboarding as complete

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Update profile to mark onboarding as complete
  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  return NextResponse.redirect(new URL('/dashboard', request.url))
}