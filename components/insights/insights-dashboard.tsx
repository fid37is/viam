'use client'

import { Application } from '@/lib/supabase/types'
import { TrendingUp, TrendingDown, Target, Clock, Award, AlertCircle } from 'lucide-react'

interface InsightsDashboardProps {
  applications: Application[]
}

export default function InsightsDashboard({ applications }: InsightsDashboardProps) {
  // Calculate statistics
  const totalApplications = applications.length
  const appliedCount = applications.filter(app => app.status === 'applied').length
  const interviewingCount = applications.filter(app => app.status === 'interviewing').length
  const offersCount = applications.filter(app => app.status === 'offer').length
  const rejectedCount = applications.filter(app => app.status === 'rejected').length

  const responseRate = appliedCount > 0 
    ? ((interviewingCount + offersCount) / appliedCount * 100).toFixed(1)
    : '0'

  const averageMatchScore = applications.length > 0
    ? (applications.reduce((sum, app) => sum + (app.match_score || 0), 0) / applications.length).toFixed(0)
    : '0'

  // Most common locations
  const locationCounts: Record<string, number> = {}
  applications.forEach(app => {
    if (app.location) {
      locationCounts[app.location] = (locationCounts[app.location] || 0) + 1
    }
  })
  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Application trend (last 7 days vs previous 7 days)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const recentApps = applications.filter(app => 
    app.created_at && new Date(app.created_at) >= sevenDaysAgo
  ).length

  const previousApps = applications.filter(app => 
    app.created_at && 
    new Date(app.created_at) >= fourteenDaysAgo && 
    new Date(app.created_at) < sevenDaysAgo
  ).length

  const trendPercentage = previousApps > 0
    ? ((recentApps - previousApps) / previousApps * 100).toFixed(0)
    : '0'

  const isPositiveTrend = Number(trendPercentage) >= 0

  return (
    <div className="space-y-6">
      {/* Overview Stats - Compact Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Total"
          value={totalApplications.toString()}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="In Progress"
          value={interviewingCount.toString()}
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Offers"
          value={offersCount.toString()}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Response"
          value={`${responseRate}%`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Trend */}
        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Application Activity</h2>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isPositiveTrend ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {isPositiveTrend ? (
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {recentApps} applications
              </p>
              <p className="text-sm text-muted-foreground">
                Last 7 days • {isPositiveTrend ? '+' : ''}{trendPercentage}% from previous week
              </p>
            </div>
          </div>
        </div>

        {/* Average Match Score */}
        {applications.some(app => app.match_score) && (
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Average Match Score</h2>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-primary">
                {averageMatchScore}%
              </div>
              <p className="text-sm text-muted-foreground">
                Overall alignment with your preferences
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-6">Status Breakdown</h2>
          <div className="space-y-4">
            <StatusBar label="Applied" count={appliedCount} total={totalApplications} color="hsl(var(--secondary))" />
            <StatusBar label="Interviewing" count={interviewingCount} total={totalApplications} color="#fbbf24" />
            <StatusBar label="Offers" count={offersCount} total={totalApplications} color="#10b981" />
            <StatusBar label="Rejected" count={rejectedCount} total={totalApplications} color="#ef4444" />
          </div>
        </div>

        {/* Top Locations */}
        {topLocations.length > 0 && (
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-6">Top Locations</h2>
            <div className="space-y-3">
              {topLocations.map(([location, count]) => (
                <div key={location} className="flex items-center justify-between py-2">
                  <span className="text-foreground font-medium">{location}</span>
                  <span className="text-sm font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {totalApplications > 0 && (
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Recommendations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {appliedCount === 0 && (
                  <li>• Start applying to the jobs you've tracked</li>
                )}
                {responseRate === '0' && appliedCount > 0 && (
                  <li>• Follow up on your applications to increase response rate</li>
                )}
                {Number(averageMatchScore) < 70 && (
                  <li>• Consider targeting companies with higher match scores</li>
                )}
                {recentApps < 3 && (
                  <li>• Try to apply to at least 3-5 jobs per week for better results</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalApplications === 0 && (
        <div className="bg-card rounded-2xl shadow-sm p-12 border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No data yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Start tracking applications to see your insights
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { 
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-card rounded-xl shadow-sm p-5 border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function StatusBar({ label, count, total, color }: {
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? (count / total * 100).toFixed(0) : '0'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}