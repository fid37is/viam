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

  if (error) {
    console.error('Error fetching applications:', error)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Applications
          </h1>
          <p className="text-gray-600">
            Track and manage your job applications
          </p>
        </div>

        <Link href="/dashboard/applications/new">
          <Button
            className="h-12 px-6 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#00e0ff' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Application
          </Button>
        </Link>
      </div>

      <ApplicationsList initialApplications={applications || []} />
    </div>
  )
}