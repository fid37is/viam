'use client'

import { Application } from '@/lib/supabase/types'
import { TrendingUp, TrendingDown, Target, Clock, Award, Sparkles, X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface InsightsDashboardProps {
  applications: Application[]
}

function InsightsDashboard({ applications }: InsightsDashboardProps) {
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [aiInsights, setAiInsights] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Calculate statistics
  const totalApplications = applications.length
  const appliedCount = applications.filter(app => app.status === 'applied').length
  const interviewingCount = applications.filter(app => app.status === 'interviewing').length
  const offersCount = applications.filter(app => app.status === 'offer').length
  const rejectedCount = applications.filter(app => app.status === 'rejected').length
  const notAppliedCount = applications.filter(app => app.status === 'not_applied').length

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

  const handleGetAIInsights = async () => {
    setShowAIInsights(true)
    setLoading(true)

    try {
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalApplications,
          appliedCount,
          interviewingCount,
          offersCount,
          rejectedCount,
          notAppliedCount,
          responseRate,
          averageMatchScore,
          recentApps,
          previousApps,
          topLocations: topLocations.map(([loc, count]) => ({ location: loc, count })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data = await response.json()
      setAiInsights(data.insights)
    } catch (error) {
      console.error('Error generating AI insights:', error)
      setAiInsights('Sorry, I couldn\'t generate insights at this time. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Listen for AI Insights trigger from button
  useEffect(() => {
    const handleOpenInsights = () => {
      handleGetAIInsights()
    }
    window.addEventListener('openAIInsights', handleOpenInsights)
    return () => window.removeEventListener('openAIInsights', handleOpenInsights)
  }, [])

  return (
    <div className="space-y-6">
      {/* AI Insights Modal */}
      {showAIInsights && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">AI Career Advisor</h2>
                    <p className="text-sm text-muted-foreground">Personalized insights for your job search</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIInsights(false)}
                  className="hover:bg-accent"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">Analyzing your job search patterns...</p>
                </div>
              ) : aiInsights ? (
                <div className="space-y-4">
                  {aiInsights.split('\n').map((line, index) => {
                    // Section headers with dividers
                    if (line.startsWith('━━━')) {
                      const title = line.replace(/━━━/g, '').trim()
                      return (
                        <div key={index} className="pt-6 first:pt-0">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                            <h3 className="text-base font-semibold text-primary uppercase tracking-wide">
                              {title}
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                          </div>
                        </div>
                      )
                    }
                    
                    // Bullet points
                    if (line.trim().startsWith('•')) {
                      return (
                        <div key={index} className="flex gap-3 text-foreground/90 leading-relaxed pl-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span className="flex-1">{line.replace(/^\s*•\s*/, '')}</span>
                        </div>
                      )
                    }
                    
                    // Empty lines for spacing
                    if (line.trim() === '') {
                      return <div key={index} className="h-2"></div>
                    }
                    
                    // Regular paragraphs
                    return (
                      <p key={index} className="text-foreground/90 leading-relaxed">
                        {line}
                      </p>
                    )
                  })}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                💡 These insights are AI-generated based on your application data
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Footer Note */}
      {totalApplications > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Need personalized advice?</h3>
              <p className="text-sm text-muted-foreground">
                Click the AI Advisor icon at the top right to get intelligent insights and recommendations for your job search
              </p>
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

InsightsDashboard.displayName = 'InsightsDashboard'

export default InsightsDashboard

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