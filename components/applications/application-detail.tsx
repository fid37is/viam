'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Application } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Building2,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ApplicationDetailProps {
  application: Application
}

// Format job description to make it readable
function formatJobDescription(description: string) {
  if (!description) return null

  // Split by double newlines or single newlines
  const lines = description.split('\n').filter(line => line.trim())
  
  const formattedContent: React.ReactElement[] = []
  let currentList: string[] = []
  let listType: 'bullet' | 'number' | null = null

  const flushList = () => {
    if (currentList.length > 0) {
      formattedContent.push(
        <ul key={formattedContent.length} className="list-disc list-inside space-y-2 my-4 ml-4">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-muted-foreground leading-relaxed">{item}</li>
          ))}
        </ul>
      )
      currentList = []
      listType = null
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    // Check if it's a bullet point
    if (/^[•\-\*]\s+/.test(trimmed)) {
      const text = trimmed.replace(/^[•\-\*]\s+/, '')
      currentList.push(text)
      listType = 'bullet'
    }
    // Check if it's a numbered list
    else if (/^\d+[\.)]\s+/.test(trimmed)) {
      const text = trimmed.replace(/^\d+[\.)]\s+/, '')
      currentList.push(text)
      listType = 'number'
    }
    // Check if it looks like a heading (all caps, short, or ends with colon)
    else if (
      (trimmed === trimmed.toUpperCase() && trimmed.length < 50 && trimmed.length > 3) ||
      (trimmed.endsWith(':') && trimmed.length < 80)
    ) {
      flushList()
      formattedContent.push(
        <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3">
          {trimmed.replace(/:$/, '')}
        </h3>
      )
    }
    // Regular paragraph
    else if (trimmed.length > 0) {
      flushList()
      formattedContent.push(
        <p key={index} className="text-muted-foreground leading-relaxed mb-4">
          {trimmed}
        </p>
      )
    }
  })

  flushList()

  return <div className="space-y-2">{formattedContent}</div>
}

export default function ApplicationDetail({ application }: ApplicationDetailProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', application.id)

      if (error) throw error

      toast.success('Application deleted', { style: { color: '#16a34a' } })
      router.push('/dashboard/applications')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message, { style: { color: '#dc2626' } })
    } finally {
      setDeleting(false)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground'
    if (score >= 85) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-blue-600 dark:text-blue-400'
    if (score >= 55) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreLabel = (score: number | null) => {
    if (!score) return 'No Match Score'
    if (score >= 85) return 'Excellent Match'
    if (score >= 70) return 'Good Match'
    if (score >= 55) return 'Moderate Match'
    if (score >= 40) return 'Weak Match'
    return 'Poor Match'
  }

  const matchAnalysis = application.match_analysis as any

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/applications">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {application.job_title}
              </h1>
              <p className="text-xl text-muted-foreground mb-3">{application.company_name}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {application.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{application.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Added {formatDate(application.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-2 z-10">
                <button
                  onClick={() => router.push(`/dashboard/applications/${application.id}/edit`)}
                  className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground"
                >
                  <Edit className="w-4 h-4" />
                  Edit Application
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Delete Application'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Status</h2>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  application.status
                )}`}
              >
                {getStatusLabel(application.status)}
              </span>
              {application.applied_date && (
                <span className="text-sm text-muted-foreground">
                  Applied on {formatDate(application.applied_date)}
                </span>
              )}
            </div>
          </div>

          {/* Match Analysis */}
          {application.match_score && matchAnalysis && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Match Analysis</h2>
              </div>

              {/* Summary */}
              <div className="mb-6 p-4 rounded-xl bg-primary/5">
                <p className="text-foreground">{matchAnalysis.summary}</p>
              </div>

              <div className="space-y-6">
                {/* Strengths */}
                {matchAnalysis.strengths && matchAnalysis.strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold text-foreground">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {matchAnalysis.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concerns */}
                {matchAnalysis.concerns && matchAnalysis.concerns.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="font-semibold text-foreground">Concerns</h3>
                    </div>
                    <ul className="space-y-2">
                      {matchAnalysis.concerns.map((concern: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {matchAnalysis.recommendations && matchAnalysis.recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-foreground">Recommendations</h3>
                    </div>
                    <ul className="space-y-2">
                      {matchAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Job Description - Now Beautifully Formatted */}
          {application.job_description && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Job Description</h2>
              <div className="max-w-none">
                {formatJobDescription(application.job_description)}
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Notes</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{application.notes}</p>
            </div>
          )}

          {/* Job URL */}
          {application.job_url && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Original Posting</h2>
              <a
                href={application.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="truncate">{application.job_url}</span>
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Match Score */}
          {application.match_score && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Match Score</h3>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-3 bg-primary/10">
                  <span className={`text-4xl font-bold ${getScoreColor(application.match_score)}`}>
                    {application.match_score}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {getScoreLabel(application.match_score)}
                </p>
                <p className="text-xs text-muted-foreground">Based on your preferences</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl"
                onClick={() => router.push(`/dashboard/applications/${application.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
              {application.job_url && (
                <a href={application.job_url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full justify-start rounded-xl">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Job Posting
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Added to TrailAm</p>
                  <p className="text-xs text-muted-foreground">{formatDate(application.created_at)}</p>
                </div>
              </div>
              {application.applied_date && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Applied</p>
                    <p className="text-xs text-muted-foreground">{formatDate(application.applied_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}