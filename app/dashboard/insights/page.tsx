import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InsightsDashboard from '@/components/insights/insights-dashboard'
import AIAdvisorButton from '@/components/insights/ai-advisor-button'

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
    <div className="px-4 sm:px-6">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Insights
            </h1>
            <p className="text-muted-foreground">
              Analyze your job applications progress and patterns
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <AIAdvisorButton applications={applications || []} />
        </div>
      </div>

      <InsightsDashboard applications={applications || []} />
    </div>
  )
}