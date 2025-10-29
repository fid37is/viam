// ==========================================
// FILE: app/(dashboard)/dashboard/page.tsx
// ==========================================
// Main dashboard page

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's applications
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Track your job applications and discover the perfect fit
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Applications"
          value={applications?.length || 0}
          color="blue"
        />
        <StatCard
          label="Applied"
          value={applications?.filter(a => a.status === 'applied').length || 0}
          color="green"
        />
        <StatCard
          label="Interviewing"
          value={applications?.filter(a => a.status === 'interviewing').length || 0}
          color="yellow"
        />
        <StatCard
          label="Offers"
          value={applications?.filter(a => a.status === 'offer').length || 0}
          color="purple"
        />
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Applications
          </h2>
          <Link href="/dashboard/applications/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
          </Link>
        </div>

        <div className="p-6">
          {!applications || applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                No applications yet. Start tracking your job search!
              </p>
              <Link href="/dashboard/applications/new">
                <Button>Add Your First Application</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/applications/${app.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {app.job_title}
                      </h3>
                      <p className="text-sm text-gray-600">{app.company_name}</p>
                    </div>
                    {app.match_score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {app.match_score}%
                        </div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${colors[color]}`}>
        {value}
      </div>
    </div>
  )
}
