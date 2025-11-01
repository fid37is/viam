import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ApplicationsList from '@/components/applications/applications-list';
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function ApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch all applications
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching applications:', error)
  }

  const userPlan = (subscription?.tier || 'free') as 'free' | 'premium'

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Applications
          </h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>

        <Link href="/dashboard/applications/new" className="w-full sm:w-auto">
          <Button
            className="w-full sm:w-auto h-12 px-6 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add Application</span>
          </Button>
        </Link>
      </div>

      <ApplicationsList initialApplications={applications || []} userPlan={userPlan} />
    </div>
  )
}