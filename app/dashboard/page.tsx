// ==========================================
// FILE: app/(dashboard)/dashboard/page.tsx
// ==========================================
// Main dashboard page

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, ChevronRight, AlertCircle, TrendingUp, Zap, Clock } from 'lucide-react'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all applications
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Calculate stats
  const stats = {
    total: applications?.length || 0,
    applied: applications?.filter(a => a.status === 'applied').length || 0,
    interviewing: applications?.filter(a => a.status === 'interviewing').length || 0,
    offers: applications?.filter(a => a.status === 'offer').length || 0,
  }

  // Identify action items
  const oldApplications = applications?.filter(app => {
    if (app.status !== 'applied' || !app.created_at) return false
    const daysOld = Math.floor((Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysOld > 7
  }) || []

  const highMatchApplications = applications?.filter(app => app.match_score && app.match_score >= 80).slice(0, 3) || []

  const notAppliedCount = applications?.filter(a => a.status === 'not_applied').length || 0

  // Recent activity (last 5 apps added)
  const recentActivity = applications?.slice(0, 5) || []

  const hasActionItems = oldApplications.length > 0 || notAppliedCount > 0 || highMatchApplications.length > 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl shadow-sm border border-primary/20 p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your job applications and land your next role
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Applied" value={stats.applied} />
        <StatCard label="Interviewing" value={stats.interviewing} />
        <StatCard label="Offers" value={stats.offers} />
      </div>

      {/* Action Items */}
      {hasActionItems && (
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900/40 p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">
                Action Items
              </h2>
              <div className="space-y-2">
                {oldApplications.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white dark:bg-background rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-start sm:items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="text-sm text-amber-900 dark:text-amber-100 min-w-0">
                        <span className="font-semibold">{oldApplications.length}</span> application{oldApplications.length !== 1 ? 's' : ''} waiting 7+ days for response
                      </span>
                    </div>
                    <Link href="/dashboard/applications?status=applied">
                      <Button size="sm" variant="ghost" className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 flex-shrink-0">
                        Follow up
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
                {notAppliedCount > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white dark:bg-background rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-start sm:items-center gap-2 min-w-0">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="text-sm text-amber-900 dark:text-amber-100 min-w-0">
                        <span className="font-semibold">{notAppliedCount}</span> position{notAppliedCount !== 1 ? 's' : ''} ready to apply to
                      </span>
                    </div>
                    <Link href="/dashboard/applications?status=not_applied">
                      <Button size="sm" variant="ghost" className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 flex-shrink-0">
                        Apply now
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
                {highMatchApplications.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white dark:bg-background rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-start sm:items-center gap-2 min-w-0">
                      <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="text-sm text-amber-900 dark:text-amber-100 min-w-0">
                        <span className="font-semibold">{highMatchApplications.length}</span> high-match position{highMatchApplications.length !== 1 ? 's' : ''} to prioritize
                      </span>
                    </div>
                    <Link href="/dashboard/applications?sort=match">
                      <Button size="sm" variant="ghost" className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 flex-shrink-0">
                        View
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h2>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No activity yet
              </p>
              <Link href="/dashboard/applications/new">
                <Button className="bg-primary text-primary-foreground hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/applications/${app.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition min-w-0"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {app.job_title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {app.company_name}
                        </p>
                      </div>
                      {app.match_score && (
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold text-primary">
                            {app.match_score}%
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Added {formatDate(app.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* High Match Applications */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Top Matches
          </h2>
          {highMatchApplications.length > 0 ? (
            <div className="space-y-3">
              {highMatchApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/applications/${app.id}`}
                  className="p-3 rounded-lg border border-border hover:border-primary/50 transition min-w-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {app.job_title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.company_name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-primary">
                        {app.match_score}%
                      </div>
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-1 ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No high-match positions yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Applications with 80%+ match score will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Link href="/dashboard/applications">
          <div className="bg-card rounded-xl shadow-sm border border-border p-3 sm:p-4 hover:border-primary/50 transition text-center min-w-0">
            <div className="text-2xl font-bold text-foreground mb-2">{stats.total}</div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">View All Applications</p>
          </div>
        </Link>
        <Link href="/dashboard/applications/new">
          <div className="bg-card rounded-xl shadow-sm border border-border p-3 sm:p-4 hover:border-primary/50 transition text-center">
            <Plus className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Add Application</p>
          </div>
        </Link>
        <Link href="/dashboard/insights">
          <div className="bg-card rounded-xl shadow-sm border border-border p-3 sm:p-4 hover:border-primary/50 transition text-center">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground truncate">View Insights</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4 hover:border-primary/50 transition-colors">
      <div className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl sm:text-3xl font-bold text-foreground">{value}</div>
    </div>
  )
}