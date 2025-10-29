'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, Building2, MapPin, Briefcase, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { Application } from '@/lib/supabase/types'
import Link from 'next/link'

interface EditApplicationFormProps {
  application: Application
}

export default function EditApplicationForm({ application }: EditApplicationFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)

  // Form fields
  const [jobUrl, setJobUrl] = useState(application.job_url)
  const [jobTitle, setJobTitle] = useState(application.job_title)
  const [companyName, setCompanyName] = useState(application.company_name)
  const [location, setLocation] = useState(application.location || '')
  const [jobDescription, setJobDescription] = useState(application.job_description || '')
  const [status, setStatus] = useState(application.status || 'not_applied')
  const [appliedDate, setAppliedDate] = useState(application.applied_date || '')
  const [notes, setNotes] = useState(application.notes || '')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobTitle || !companyName) {
      toast.error('Job title and company name are required', { style: { color: '#dc2626' } })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          job_url: jobUrl,
          job_title: jobTitle,
          company_name: companyName,
          location: location || null,
          job_description: jobDescription || null,
          status: status,
          applied_date: status === 'applied' && appliedDate ? appliedDate : null,
          notes: notes || null,
        })
        .eq('id', application.id)

      if (error) throw error

      toast.success('Application updated successfully!', { style: { color: '#16a34a' } })
      
      router.push(`/dashboard/applications/${application.id}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update application', {
        style: { color: '#dc2626' }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href={`/dashboard/applications/${application.id}`}>
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Application
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Edit Application
        </h1>
        <p className="text-gray-600">
          Update your application details
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Job URL */}
          <div>
            <Label htmlFor="jobUrl" className="text-gray-700 font-medium">
              Job URL
            </Label>
            <div className="relative mt-2">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="jobUrl"
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://example.com/jobs/software-engineer"
                className="h-12 pl-10 border-gray-300 focus:border-transparent focus:ring-2 rounded-xl"
                style={{ '--tw-ring-color': '#00e0ff' } as any}
              />
            </div>
          </div>

          {/* Job Title */}
          <div>
            <Label htmlFor="jobTitle" className="text-gray-700 font-medium">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-2">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Software Engineer"
                className="h-12 pl-10 border-gray-300 focus:border-transparent focus:ring-2 rounded-xl"
                style={{ '--tw-ring-color': '#00e0ff' } as any}
                required
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="companyName" className="text-gray-700 font-medium">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-2">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corporation"
                className="h-12 pl-10 border-gray-300 focus:border-transparent focus:ring-2 rounded-xl"
                style={{ '--tw-ring-color': '#00e0ff' } as any}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-gray-700 font-medium">
              Location
            </Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA (Remote)"
                className="h-12 pl-10 border-gray-300 focus:border-transparent focus:ring-2 rounded-xl"
                style={{ '--tw-ring-color': '#00e0ff' } as any}
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <Label htmlFor="jobDescription" className="text-gray-700 font-medium">
              Job Description
            </Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={6}
              className="mt-2 border-gray-300 focus:border-transparent focus:ring-2 rounded-xl resize-none"
              style={{ '--tw-ring-color': '#00e0ff' } as any}
            />
          </div>

          {/* Application Status */}
          <div>
            <Label className="text-gray-700 font-medium mb-3 block">
              Application Status
            </Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:border-transparent focus:ring-2 focus:outline-none"
              style={{ '--tw-ring-color': '#00e0ff' } as any}
            >
              <option value="not_applied">Not Applied</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Applied Date */}
          {(status === 'applied' || status === 'interviewing' || status === 'offer') && (
            <div>
              <Label htmlFor="appliedDate" className="text-gray-700 font-medium">
                Application Date
              </Label>
              <Input
                id="appliedDate"
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="h-12 mt-2 border-gray-300 focus:border-transparent focus:ring-2 rounded-xl"
                style={{ '--tw-ring-color': '#00e0ff' } as any}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-gray-700 font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or thoughts about this opportunity..."
              rows={4}
              className="mt-2 border-gray-300 focus:border-transparent focus:ring-2 rounded-xl resize-none"
              style={{ '--tw-ring-color': '#00e0ff' } as any}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Link href={`/dashboard/applications/${application.id}`} className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-300 rounded-xl"
                disabled={loading}
              >
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#00e0ff' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}