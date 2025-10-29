'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Link as LinkIcon, Building2, MapPin, Briefcase } from 'lucide-react'
import { toast } from 'sonner'

interface AddApplicationFormProps {
  userId: string
}

export default function AddApplicationForm({ userId }: AddApplicationFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'url' | 'details'>('url')
  const [loading, setLoading] = useState(false)

  // Form fields
  const [jobUrl, setJobUrl] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [location, setLocation] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [status, setStatus] = useState<'not_applied' | 'applied'>('not_applied')
  const [appliedDate, setAppliedDate] = useState('')
  const [notes, setNotes] = useState('')

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobUrl) {
      toast.error('Please enter a job URL', { style: { color: '#dc2626' } })
      return
    }

    setLoading(true)

    try {
      // Call API to scrape job details
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch job details')
      }

      const data = await response.json()

      // Pre-fill form with scraped data
      setJobTitle(data.jobTitle || '')
      setCompanyName(data.companyName || '')
      setLocation(data.location || '')
      setJobDescription(data.description || '')

      setStep('details')
      toast.success('Job details extracted!', { style: { color: '#16a34a' } })
    } catch (err: any) {
      toast.error(err.message || 'Failed to extract job details. Please enter manually.', {
        style: { color: '#dc2626' }
      })
      // Still allow manual entry
      setStep('details')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobTitle || !companyName) {
      toast.error('Job title and company name are required', { style: { color: '#dc2626' } })
      return
    }

    setLoading(true)

    try {
      // Save application to database
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          job_url: jobUrl,
          job_title: jobTitle,
          company_name: companyName,
          location: location || null,
          job_description: jobDescription || null,
          status: status,
          applied_date: status === 'applied' && appliedDate ? appliedDate : null,
          notes: notes || null,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Application added successfully!', { style: { color: '#16a34a' } })
      
      // Redirect to applications list
      router.push('/dashboard/applications')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save application', {
        style: { color: '#dc2626' }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('url')
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      {step === 'url' ? (
        <form onSubmit={handleUrlSubmit} className="space-y-6">
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
                disabled={loading}
                autoFocus
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Paste the link from LinkedIn, Indeed, or any job board
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#00e0ff' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Extracting details...
              </>
            ) : (
              'Continue'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('details')}
            className="w-full h-12 border-gray-300 rounded-xl"
          >
            Enter details manually
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSaveApplication} className="space-y-6">
          {/* Job URL (read-only if scraped) */}
          <div>
            <Label htmlFor="jobUrlDisplay" className="text-gray-700 font-medium">
              Job URL
            </Label>
            <div className="relative mt-2">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="jobUrlDisplay"
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
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('not_applied')}
                className={`
                  p-4 rounded-xl border-2 text-center transition-all
                  ${status === 'not_applied'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                style={status === 'not_applied' ? { borderColor: '#00e0ff' } : {}}
              >
                <div className="font-semibold text-gray-900">Not Applied Yet</div>
                <div className="text-sm text-gray-600 mt-1">Planning to apply</div>
              </button>

              <button
                type="button"
                onClick={() => setStatus('applied')}
                className={`
                  p-4 rounded-xl border-2 text-center transition-all
                  ${status === 'applied'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                style={status === 'applied' ? { borderColor: '#00e0ff' } : {}}
              >
                <div className="font-semibold text-gray-900">Already Applied</div>
                <div className="text-sm text-gray-600 mt-1">Submitted application</div>
              </button>
            </div>
          </div>

          {/* Applied Date (if already applied) */}
          {status === 'applied' && (
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
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 border-gray-300 rounded-xl"
              disabled={loading}
            >
              Back
            </Button>

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
                'Save Application'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}