// app/admin/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import AdminDashboard from '@/components/admin/adminDashboard'

export default async function AdminPage() {
  const { createClient: createServerClient } = await import('@/lib/supabase/server')
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Use service_role client to check admin status
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error || !profile?.is_admin) {
    redirect('/dashboard')
  }

  return <AdminDashboard />
}