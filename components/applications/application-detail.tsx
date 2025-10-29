'use client'

import { useState } from 'react'
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
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ApplicationDetailProps {
  application: Application
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
            {/* Company Logo Placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-gray-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {application.job_title}
              </h1>
              <p className="text-xl text-gray-600 mb-3">{application.company_name}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => router.push(`/dashboard/applications/${application.id}/edit`)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit Application
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
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
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  application.status
                )}`}
              >
                {getStatusLabel(application.status)}
              </span>
              {application.applied_date && (
                <span className="text-sm text-gray-600">
                  Applied on {formatDate(application.applied_date)}
                </span>
              )}
            </div>
          </div>

          {/* Job Description */}
          {application.job_description && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                {application.job_description}
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{application.notes}</p>
            </div>
          )}

          {/* Job URL */}
          {application.job_url && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Original Posting</h2>
              <a
                href={application.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
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
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Match Score</h3>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{ color: '#00e0ff' }}>
                  {application.match_score}%
                </div>
                <p className="text-sm text-gray-600">Alignment with your preferences</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Quick Actions</h3>
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
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#00e0ff' }} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Added to TraceAm</p>
                  <p className="text-xs text-gray-500">{formatDate(application.created_at)}</p>
                </div>
              </div>
              {application.applied_date && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#00e0ff' }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Applied</p>
                    <p className="text-xs text-gray-500">{formatDate(application.applied_date)}</p>
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