import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InsightsDashboard from '@/components/insights/insights-dashboard'

export default async function InsightsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch all applications for analytics
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Insights
        </h1>
        <p className="text-gray-600">
          Analyze your job search progress and patterns
        </p>
      </div>

      <InsightsDashboard applications={applications || []} />
    </div>
  )
}