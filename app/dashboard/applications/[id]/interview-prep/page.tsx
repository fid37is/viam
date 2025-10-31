// app/dashboard/applications/[id]/interview-prep/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  Brain,
  Lightbulb,
  FileText,
  Clock,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/database.types'



type Application = Database['public']['Tables']['applications']['Row']

type InterviewQuestion = {
  id: string
  category: string
  question: string
  tips: string[]
  sample_answer?: string
}

type InterviewPrep = {
  questions: InterviewQuestion[]
  key_topics: string[]
  preparation_tips: string[]
  company_insights: string[]
  generated_at: string
}

export default function InterviewPrepPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrep | null>(null)
  
  // Practice mode
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null)
  const [practiceAnswer, setPracticeAnswer] = useState('')
  const [isPracticing, setIsPracticing] = useState(false)
  const [practiceTime, setPracticeTime] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // Get the id from params safely
  const applicationId = typeof params.id === 'string' ? params.id : undefined

  useEffect(() => {
    if (applicationId) {
      loadApplication()
    }
  }, [applicationId])

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [timerInterval])

  const loadApplication = async () => {
    if (!applicationId) return
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single()

      if (error) throw error

      setApplication(data)
      
      if (data.interview_questions) {
        setInterviewPrep(data.interview_questions as InterviewPrep)
      }
    } catch (error: any) {
      toast.error('Failed to load application', { style: { color: '#dc2626' } })
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePrep = async () => {
    if (!applicationId) return
    
    setGenerating(true)
    
    try {
      const response = await fetch('/api/generate-interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate interview prep')
      }

      const { interviewPrep: newPrep } = await response.json()
      setInterviewPrep(newPrep)
      
      toast.success('Interview questions generated!', { style: { color: '#16a34a' } })
      await loadApplication() // Reload to get updated data
      
    } catch (error: any) {
      toast.error(error.message, { style: { color: '#dc2626' } })
    } finally {
      setGenerating(false)
    }
  }

  const startPractice = (question: InterviewQuestion) => {
    setSelectedQuestion(question)
    setPracticeAnswer('')
    setIsPracticing(true)
    setPracticeTime(0)
    
    const interval = setInterval(() => {
      setPracticeTime(prev => prev + 1)
    }, 1000)
    setTimerInterval(interval)
  }

  const pausePractice = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }

  const resetPractice = () => {
    setIsPracticing(false)
    setSelectedQuestion(null)
    setPracticeAnswer('')
    setPracticeTime(0)
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavioral':
        return 'bg-blue-100 text-blue-700'
      case 'technical':
        return 'bg-purple-100 text-purple-700'
      case 'company-specific':
        return 'bg-green-100 text-green-700'
      case 'role-specific':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00e0ff' }} />
      </div>
    )
  }

  if (!application) {
    return <div>Application not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/dashboard/applications/${applicationId}`}>
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Application
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Preparation
            </h1>
            <p className="text-gray-600">
              {application.job_title} at {application.company_name}
            </p>
          </div>

          {!interviewPrep && (
            <Button
              onClick={handleGeneratePrep}
              disabled={generating}
              className="text-black font-semibold rounded-xl"
              style={{ backgroundColor: '#00e0ff' }}
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Generate Interview Prep
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {!interviewPrep ? (
        <div className="bg-white rounded-3xl shadow-lg p-12 border border-gray-100 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No Interview Prep Yet
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Generate AI-powered interview questions tailored to this specific role and company.
          </p>
          <Button
            onClick={handleGeneratePrep}
            disabled={generating}
            className="text-black font-semibold rounded-xl px-8"
            style={{ backgroundColor: '#00e0ff' }}
          >
            {generating ? 'Generating...' : 'Generate Interview Prep'}
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Questions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Practice Mode */}
            {selectedQuestion && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-primary">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Practice Mode</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="font-mono text-sm font-medium">
                        {formatTime(practiceTime)}
                      </span>
                    </div>
                    {timerInterval ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={pausePractice}
                        className="rounded-lg"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    ) : isPracticing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const interval = setInterval(() => {
                            setPracticeTime(prev => prev + 1)
                          }, 1000)
                          setTimerInterval(interval)
                        }}
                        className="rounded-lg"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPractice}
                      className="rounded-lg"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getCategoryColor(selectedQuestion.category)}`}>
                      {selectedQuestion.category.replace('-', ' ')}
                    </span>
                    <p className="text-lg font-medium text-gray-900">{selectedQuestion.question}</p>
                  </div>

                  <Textarea
                    value={practiceAnswer}
                    onChange={(e) => setPracticeAnswer(e.target.value)}
                    placeholder="Type your answer here... Use the STAR method for behavioral questions (Situation, Task, Action, Result)"
                    rows={8}
                    className="border-gray-300 focus:border-transparent focus:ring-2 rounded-xl resize-none"
                    style={{ '--tw-ring-color': '#00e0ff' } as React.CSSProperties}
                  />

                  {selectedQuestion.tips && selectedQuestion.tips.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Tips
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-800">
                        {selectedQuestion.tips.map((tip, idx) => (
                          <li key={idx}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Interview Questions</h2>
              
              <div className="space-y-3">
                {interviewPrep.questions.map((question, idx) => (
                  <div
                    key={question.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-primary transition-colors cursor-pointer"
                    onClick={() => startPractice(question)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                            {question.category.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">Question {idx + 1}</span>
                        </div>
                        <p className="text-gray-900 font-medium">{question.question}</p>
                      </div>
                      <Play className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Prep Materials */}
          <div className="space-y-6">
            {/* Key Topics */}
            {interviewPrep.key_topics && interviewPrep.key_topics.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Key Topics</h3>
                </div>
                <ul className="space-y-2">
                  {interviewPrep.key_topics.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00e0ff' }} />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preparation Tips */}
            {interviewPrep.preparation_tips && interviewPrep.preparation_tips.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Preparation Tips</h3>
                </div>
                <ul className="space-y-3">
                  {interviewPrep.preparation_tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">{idx + 1}.</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Company Insights */}
            {interviewPrep.company_insights && interviewPrep.company_insights.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Company Insights</h3>
                </div>
                <ul className="space-y-3">
                  {interviewPrep.company_insights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-primary">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Regenerate Button */}
            <Button
              onClick={handleGeneratePrep}
              disabled={generating}
              variant="outline"
              className="w-full rounded-xl"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate Questions
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}