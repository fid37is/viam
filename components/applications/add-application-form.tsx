'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Link as LinkIcon, Building2, MapPin, Briefcase, Sparkles, CheckCircle, AlertCircle, Lightbulb, FileText, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface AddApplicationFormProps {
  userId: string
}

interface MatchAnalysis {
  matchScore: number | null
  analysis: {
    strengths: string[]
    concerns: string[]
    recommendations: string[]
    summary: string
  }
}

export default function AddApplicationForm({ userId }: AddApplicationFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'url' | 'details' | 'analysis'>('url')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // Form fields
  const [jobUrl, setJobUrl] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [location, setLocation] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [status, setStatus] = useState<'not_applied' | 'applied'>('not_applied')
  const [appliedDate, setAppliedDate] = useState('')
  const [notes, setNotes] = useState('')

  // Match analysis
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null)
  
  // Interview prep
  const [interviewPrepEnabled, setInterviewPrepEnabled] = useState(false)

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobUrl) {
      toast.error('Please enter a job URL', { style: { color: '#dc2626' } })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch job details')
      }

      const data = await response.json()

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
      setStep('details')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeMatch = async () => {
    if (!jobTitle || !companyName) {
      toast.error('Job title and company name are required', { style: { color: '#dc2626' } })
      return
    }

    setAnalyzing(true)

    try {
      const response = await fetch('/api/analyze-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          companyName,
          location,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze match')
      }

      const data = await response.json()
      setMatchAnalysis(data)
      setStep('analysis')
    } catch (err: any) {
      toast.error(err.message || 'Failed to analyze match', {
        style: { color: '#dc2626' }
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSaveApplication = async () => {
    setLoading(true)

    try {
      // First, research company and get/create company record
      let companyId: string | null = null
      
      try {
        const companyResponse = await fetch('/api/research-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName,
            website: jobUrl ? new URL(jobUrl).origin : null
          }),
        })

        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          companyId = companyData.company?.id || null
        }
      } catch (err) {
        console.error('Company research failed:', err)
        // Continue without company link
      }

      // Save application
      const { data: application, error } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          company_id: companyId,
          job_url: jobUrl,
          job_title: jobTitle,
          company_name: companyName,
          location: location || null,
          job_description: jobDescription || null,
          status: status,
          applied_date: status === 'applied' && appliedDate ? appliedDate : null,
          notes: notes || null,
          match_score: matchAnalysis?.matchScore || null,
          match_analysis: matchAnalysis?.analysis || null,
          interview_prep_enabled: interviewPrepEnabled,
        })
        .select()
        .single()

      if (error) throw error

      // If interview prep enabled, generate questions
      if (interviewPrepEnabled && application) {
        try {
          await fetch('/api/generate-interview-prep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: application.id }),
          })
        } catch (err) {
          console.error('Interview prep generation failed:', err)
          // Don't block save if this fails
        }
      }

      toast.success('Application added successfully!', { style: { color: '#16a34a' } })
      
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
    if (step === 'analysis') {
      setStep('details')
    } else {
      setStep('url')
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground'
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 55) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number | null) => {
    if (!score) return 'No Score'
    if (score >= 85) return 'Excellent Match'
    if (score >= 70) return 'Good Match'
    if (score >= 55) return 'Moderate Match'
    if (score >= 40) return 'Weak Match'
    return 'Poor Match'
  }

  return (
    <div>
      {/* Back Button */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-6 text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </Button>

      <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
        {step === 'url' ? (
          <form onSubmit={handleUrlSubmit} className="space-y-6">
            <div>
              <Label htmlFor="jobUrl" className="text-foreground font-medium">
                Job URL
              </Label>
              <div className="relative mt-2">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="jobUrl"
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://example.com/jobs/software-engineer"
                  className="h-12 pl-10 border-input focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Paste the link from LinkedIn, Indeed, or any job board
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
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
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('details')}
              className="w-full h-12 border-border rounded-xl hover:bg-accent hover:text-accent-foreground"
            >
              Enter details manually
            </Button>
          </form>
        ) : step === 'details' ? (
          <form onSubmit={(e) => { e.preventDefault(); handleAnalyzeMatch(); }} className="space-y-6">
            <div>
              <Label htmlFor="jobUrlDisplay" className="text-foreground font-medium">
                Job URL
              </Label>
              <div className="relative mt-2">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="jobUrlDisplay"
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://example.com/jobs/software-engineer"
                  className="h-12 pl-10 border-input focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="jobTitle" className="text-foreground font-medium">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-2">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Software Engineer"
                  className="h-12 pl-10 border-input focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="companyName" className="text-foreground font-medium">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-2">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corporation"
                  className="h-12 pl-10 border-input focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-foreground font-medium">
                Location
              </Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA (Remote)"
                  className="h-12 pl-10 border-input focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="jobDescription" className="text-foreground font-medium">
                Job Description
              </Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
                className="mt-2 border-input focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl resize-none"
              />
            </div>

            <div>
              <Label className="text-foreground font-medium mb-3 block">
                Application Status
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('not_applied')}
                  className={`
                    p-4 rounded-xl border-2 text-center transition-all
                    ${status === 'not_applied'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground hover:bg-muted'
                    }
                  `}
                >
                  <div className="font-semibold text-foreground">Not Applied Yet</div>
                  <div className="text-sm text-muted-foreground mt-1">Planning to apply</div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('applied')}
                  className={`
                    p-4 rounded-xl border-2 text-center transition-all
                    ${status === 'applied'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground hover:bg-muted'
                    }
                  `}
                >
                  <div className="font-semibold text-foreground">Already Applied</div>
                  <div className="text-sm text-muted-foreground mt-1">Submitted application</div>
                </button>
              </div>
            </div>

            {status === 'applied' && (
              <div>
                <Label htmlFor="appliedDate" className="text-foreground font-medium">
                  Application Date
                </Label>
                <Input
                  id="appliedDate"
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="h-12 mt-2 border-input focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes" className="text-foreground font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes or thoughts about this opportunity..."
                rows={4}
                className="mt-2 border-input focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 border-border rounded-xl hover:bg-accent hover:text-accent-foreground"
                disabled={analyzing}
              >
                Back
              </Button>

              <Button
                type="submit"
                disabled={analyzing}
                className="flex-1 h-12 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Analyzing match...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Match Score Header */}
            <div className="text-center py-8 border-b border-border">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 bg-primary/10">
                <span className={`text-4xl font-bold ${getScoreColor(matchAnalysis?.matchScore || null)}`}>
                  {matchAnalysis?.matchScore || '--'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {getScoreLabel(matchAnalysis?.matchScore || null)}
              </h2>
              <p className="text-muted-foreground">
                {matchAnalysis?.analysis.summary || 'No analysis available'}
              </p>
            </div>

            {/* Strengths */}
            {matchAnalysis?.analysis.strengths && matchAnalysis.analysis.strengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-foreground">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {matchAnalysis.analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {matchAnalysis?.analysis.concerns && matchAnalysis.analysis.concerns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-foreground">Concerns</h3>
                </div>
                <ul className="space-y-2">
                  {matchAnalysis.analysis.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {matchAnalysis?.analysis.recommendations && matchAnalysis.analysis.recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-secondary" />
                  <h3 className="font-semibold text-foreground">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {matchAnalysis.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interview Prep Toggle */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Enable Interview Prep</p>
                    <p className="text-sm text-muted-foreground">Generate AI-powered interview questions for this role</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInterviewPrepEnabled(!interviewPrepEnabled)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${interviewPrepEnabled ? 'bg-primary' : 'bg-input'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${interviewPrepEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 border-border rounded-xl hover:bg-accent hover:text-accent-foreground"
                disabled={loading}
              >
                Edit Details
              </Button>

              <Button
                type="button"
                onClick={handleSaveApplication}
                disabled={loading}
                className="flex-1 h-12 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
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
          </div>
        )}
      </div>
    </div>
  )
}