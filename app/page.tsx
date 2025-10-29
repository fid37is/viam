import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HomeHero from '@/components/home/Home-hero'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If already logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return <HomeHero />
}