'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/supabase/types'
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
  Sparkles,
  FileText,
  Brain
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Application = Database['public']['Tables']['applications']['Row'] & {
  company?: Database['public']['Tables']['companies']['Row']
}

interface ApplicationDetailProps {
  application: Application
}

function formatJobDescription(description: string) {
  if (!description) return null

  const lines = description.split('\n').filter(line => line.trim())
  
  const formattedContent: React.ReactElement[] = []
  let currentList: string[] = []
  let listType: 'bullet' | 'number' | null = null

  const flushList = () => {
    if (currentList.length > 0) {
      formattedContent.push(
        <ul key={formattedContent.length} className="list-disc list-inside space-y-1 sm:space-y-2 my-3 sm:my-4 ml-2 sm:ml-4">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-muted-foreground leading-relaxed text-sm sm:text-base">{item}</li>
          ))}
        </ul>
      )
      currentList = []
      listType = null
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    if (/^[•\-\*]\s+/.test(trimmed)) {
      const text = trimmed.replace(/^[•\-\*]\s+/, '')
      currentList.push(text)
      listType = 'bullet'
    }
    else if (/^\d+[\.)]\s+/.test(trimmed)) {
      const text = trimmed.replace(/^\d+[\.)]\s+/, '')
      currentList.push(text)
      listType = 'number'
    }
    else if (
      (trimmed === trimmed.toUpperCase() && trimmed.length < 50 && trimmed.length > 3) ||
      (trimmed.endsWith(':') && trimmed.length < 80)
    ) {
      flushList()
      formattedContent.push(
        <h3 key={index} className="text-base sm:text-lg font-semibold text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3">
          {trimmed.replace(/:$/, '')}
        </h3>
      )
    }
    else if (trimmed.length > 0) {
      flushList()
      formattedContent.push(
        <p key={index} className="text-muted-foreground leading-relaxed mb-2 sm:mb-4 text-sm sm:text-base">
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
    <div className="w-full px-3 sm:px-4 md:px-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link href="/dashboard/applications">
          <Button variant="ghost" className="mb-3 sm:mb-4 -ml-2 sm:-ml-3 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
            <span className="hidden xs:inline">Back</span>
            <span className="xs:hidden">Back</span>
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 break-words">
                {application.job_title}
              </h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                {application.company?.slug ? (
                  <Link 
                    href={`/dashboard/companies/${application.company.slug}`}
                    className="text-base sm:text-xl text-primary hover:opacity-80 hover:underline transition-opacity break-words"
                  >
                    {application.company_name}
                  </Link>
                ) : (
                  <p className="text-base sm:text-xl text-muted-foreground break-words">{application.company_name}</p>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                {application.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                    <span>{application.location}</span>
                  </div>
                )}
                {application.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                    <span className="hidden xs:inline">Added {formatDate(application.created_at)}</span>
                    <span className="xs:hidden">{formatDate(application.created_at)}</span>
                  </div>
                )}
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
              <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-card rounded-lg sm:rounded-xl shadow-lg border border-border py-2 z-10">
                <button
                  onClick={() => router.push(`/dashboard/applications/${application.id}/edit`)}
                  className="w-full px-3 sm:px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full px-3 sm:px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Status Card */}
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Status</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusColor(
                  application.status
                )}`}
              >
                {getStatusLabel(application.status)}
              </span>
              {application.applied_date && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Applied on {formatDate(application.applied_date)}
                </span>
              )}
            </div>
            
            {application.status === 'interviewing' && application.interview_prep_enabled && (
              <Link href={`/dashboard/applications/${application.id}/interview-prep`} className="block mt-3 sm:mt-4">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg sm:rounded-xl text-sm sm:text-base"
                >
                  <Brain className="w-4 sm:w-5 h-4 sm:h-5 mr-1.5 sm:mr-2" />
                  Start Interview Prep
                </Button>
              </Link>
            )}
          </div>

          {/* Match Analysis */}
          {application.match_score !== null && matchAnalysis && (
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Match Analysis</h2>
              </div>

              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/5">
                <p className="text-foreground text-sm sm:text-base">{matchAnalysis.summary}</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {matchAnalysis.strengths && matchAnalysis.strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">Strengths</h3>
                    </div>
                    <ul className="space-y-1 sm:space-y-2">
                      {matchAnalysis.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchAnalysis.concerns && matchAnalysis.concerns.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">Concerns</h3>
                    </div>
                    <ul className="space-y-1 sm:space-y-2">
                      {matchAnalysis.concerns.map((concern: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchAnalysis.recommendations && matchAnalysis.recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Lightbulb className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">Recommendations</h3>
                    </div>
                    <ul className="space-y-1 sm:space-y-2">
                      {matchAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company Info Card */}
          {application.company && (
            <Link href={`/dashboard/companies/${application.company.slug}`}>
              <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-border hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Company Information</h2>
                  <ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-muted-foreground ml-auto flex-shrink-0" />
                </div>
                
                {application.company.description && (
                  <p className="text-muted-foreground mb-3 sm:mb-4 line-clamp-3 text-sm sm:text-base">
                    {application.company.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                  {application.company.industry && (
                    <span className="px-2 sm:px-3 py-1 bg-muted text-foreground rounded-full">
                      {application.company.industry}
                    </span>
                  )}
                  {application.company.company_size && (
                    <span className="px-2 sm:px-3 py-1 bg-muted text-foreground rounded-full">
                      {application.company.company_size}
                    </span>
                  )}
                  {application.company.overall_rating !== null && (
                    <span className="px-2 sm:px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                      ★ {application.company.overall_rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Job Description */}
          {application.job_description && (
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Job Description</h2>
              <div className="max-w-none text-sm sm:text-base">
                {formatJobDescription(application.job_description)}
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Notes</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{application.notes}</p>
            </div>
          )}

          {/* Job URL */}
          {application.job_url && (
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Original Posting</h2>
              <a
                href={application.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity text-sm sm:text-base"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{application.job_url}</span>
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Match Score */}
          {application.match_score !== null && (
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">Match Score</h3>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full mb-2 sm:mb-3 bg-primary/10">
                  <span className={`text-2xl sm:text-4xl font-bold ${getScoreColor(application.match_score)}`}>
                    {application.match_score}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground mb-0.5 sm:mb-1">
                  {getScoreLabel(application.match_score)}
                </p>
                <p className="text-xs text-muted-foreground">Based on your preferences</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-1.5 sm:space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg sm:rounded-xl text-sm"
                onClick={() => router.push(`/dashboard/applications/${application.id}/edit`)}
              >
                <Edit className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-2" />
                Edit Details
              </Button>
              
              {application.interview_prep_enabled && (
                <Link href={`/dashboard/applications/${application.id}/interview-prep`} className="block">
                  <Button variant="outline" className="w-full justify-start rounded-lg sm:rounded-xl text-sm">
                    <FileText className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-2" />
                    Interview Prep
                  </Button>
                </Link>
              )}
              
              {application.company && (
                <Link href={`/dashboard/companies/${application.company.slug}`} className="block">
                  <Button variant="outline" className="w-full justify-start rounded-lg sm:rounded-xl text-sm">
                    <Building2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-2" />
                    Company Info
                  </Button>
                </Link>
              )}
              
              {application.job_url && (
                <a href={application.job_url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full justify-start rounded-lg sm:rounded-xl text-sm">
                    <ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-2" />
                    View Job Posting
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">Timeline</h3>
            <div className="space-y-3 sm:space-y-4">
              {application.created_at && (
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Added to TrailAm</p>
                    <p className="text-xs text-muted-foreground">{formatDate(application.created_at)}</p>
                  </div>
                </div>
              )}
              {application.applied_date && (
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Applied</p>
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