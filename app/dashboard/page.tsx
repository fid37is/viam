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
    .limit(10)

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const stats = {
    total: applications?.length || 0,
    applied: applications?.filter(a => a.status === 'applied').length || 0,
    interviewing: applications?.filter(a => a.status === 'interviewing').length || 0,
    offers: applications?.filter(a => a.status === 'offer').length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section with Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-2 bg-card rounded-lg shadow-sm border border-border p-6">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name || 'there'}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your job applications and discover the perfect fit
          </p>
        </div>

        {/* Quick Stats - Compact Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Applied" value={stats.applied} />
          <StatCard label="Interviewing" value={stats.interviewing} />
          <StatCard label="Offers" value={stats.offers} />
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">
            Recent Applications
          </h2>
          <Link href="/dashboard/applications/new">
            <Button className="bg-primary text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
          </Link>
        </div>

        <div className="p-6">
          {!applications || applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No applications yet. Start tracking your job search!
              </p>
              <Link href="/dashboard/applications/new">
                <Button className="bg-primary text-primary-foreground hover:opacity-90">
                  Add Your First Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/applications/${app.id}`}
                  className="block p-4 border border-border rounded-lg hover:bg-accent/5 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {app.job_title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{app.company_name}</p>
                    </div>
                    {app.match_score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {app.match_score}%
                        </div>
                        <div className="text-xs text-muted-foreground">Match</div>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4">
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold text-foreground">
        {value}
      </div>
    </div>
  )
}