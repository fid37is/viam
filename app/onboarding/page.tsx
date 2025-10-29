
// ==========================================
// FILE: app/onboarding/page.tsx (NEW)
// ==========================================
// Temporary onboarding page placeholder

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-accent/10 to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Viam! 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          We'll help you set up your profile in just a moment. For now, let's get you started.
        </p>
        
        <form action="/api/complete-onboarding" method="POST">
          <button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg"
          >
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}
