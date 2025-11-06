// app/dashboard/applications/[id]/interview-prep/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
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
  AlertTriangle,
  Award,
  TrendingUp,
  RotateCcw,
  Play,
  Send,
  StopCircle
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

type UserAnswer = {
  questionId: string
  answer: string
  timeSpent: number
}

type QuestionFeedback = {
  question_id: string
  question: string
  user_answer: string
  strengths: string[]
  improvements: string[]
  ideal_approach: string
  score: number
}

type AIFeedback = {
  overall_score: number
  question_feedback: QuestionFeedback[]
  general_advice: string[]
  encouragement: string
}

export default function InterviewPrepPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrep | null>(null)
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false)
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [currentAnswerText, setCurrentAnswerText] = useState('')
  const [generalTime, setGeneralTime] = useState(0)
  const [questionTime, setQuestionTime] = useState(0)
  const [totalTimeLimit, setTotalTimeLimit] = useState(0)
  const [questionTimeLimit, setQuestionTimeLimit] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [feedback, setFeedback] = useState<AIFeedback | null>(null)
  const [showTimeWarning, setShowTimeWarning] = useState(false)
  
  const generalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null)

  const applicationId = typeof params.id === 'string' ? params.id : undefined

  useEffect(() => {
    if (applicationId) {
      loadApplication()
    }
  }, [applicationId])

  useEffect(() => {
    return () => {
      if (generalTimerRef.current) clearInterval(generalTimerRef.current)
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    }
  }, [])

  // General timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && totalTimeLimit > 0) {
      if (generalTime >= totalTimeLimit) {
        handleAutoSubmitQuiz()
      } else if (totalTimeLimit - generalTime <= 60 && !showTimeWarning) {
        setShowTimeWarning(true)
        toast.warning('Less than 1 minute remaining!', { 
          style: { color: '#ea580c' },
          duration: 5000
        })
      }
    }
  }, [generalTime, totalTimeLimit, quizStarted, quizCompleted, showTimeWarning])

  // Question timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && questionTimeLimit > 0 && expandedQuestionId) {
      if (questionTime >= questionTimeLimit) {
        handleAutoSaveAndNext()
      } else if (questionTimeLimit - questionTime === 10) {
        toast.warning('10 seconds left for this question!', { 
          style: { color: '#ea580c' },
          duration: 3000
        })
      }
    }
  }, [questionTime, questionTimeLimit, quizStarted, quizCompleted, expandedQuestionId])

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
      await loadApplication()
      
    } catch (error: any) {
      toast.error(error.message, { style: { color: '#dc2626' } })
    } finally {
      setGenerating(false)
    }
  }

  const startQuiz = () => {
    if (!interviewPrep) return
    
    const questionCount = interviewPrep.questions.length
    const baseTimePerQuestion = 150 // 2.5 minutes
    const total = questionCount * baseTimePerQuestion
    
    setTotalTimeLimit(total)
    setQuestionTimeLimit(baseTimePerQuestion)
    setQuizStarted(true)
    setUserAnswers([])
    setCurrentAnswerText('')
    setGeneralTime(0)
    setQuestionTime(0)
    setFeedback(null)
    setShowTimeWarning(false)
    // Start with first question expanded
    setExpandedQuestionId(interviewPrep.questions[0].id)
    
    // Start general timer immediately
    generalTimerRef.current = setInterval(() => {
      setGeneralTime(prev => prev + 1)
    }, 1000)
    
    // Start question timer for first question
    questionTimerRef.current = setInterval(() => {
      setQuestionTime(prev => prev + 1)
    }, 1000)
  }

  const handleStopQuiz = () => {
    if (generalTimerRef.current) clearInterval(generalTimerRef.current)
    if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    
    setQuizStarted(false)
    setExpandedQuestionId(null)
    setCurrentAnswerText('')
    setQuestionTime(0)
    setShowTimeWarning(false)
    
    toast.info('Quiz stopped. You can start again anytime.', { 
      style: { color: '#3b82f6' } 
    })
  }

  const handleAutoSaveAndNext = () => {
    if (!interviewPrep || !expandedQuestionId) return
    
    const currentQuestion = interviewPrep.questions.find(q => q.id === expandedQuestionId)
    if (!currentQuestion) return
    
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: currentAnswerText.trim() || '(No answer provided)',
      timeSpent: questionTime
    }
    
    const updatedAnswers = [...userAnswers, newAnswer]
    setUserAnswers(updatedAnswers)
    
    const allAnswered = updatedAnswers.length === interviewPrep.questions.length
    
    if (allAnswered) {
      completeQuiz(updatedAnswers)
    } else {
      // Move to next question
      const currentIndex = interviewPrep.questions.findIndex(q => q.id === expandedQuestionId)
      const nextQuestion = interviewPrep.questions[currentIndex + 1]
      
      setExpandedQuestionId(nextQuestion.id)
      setCurrentAnswerText('')
      setQuestionTime(0)
      
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
      questionTimerRef.current = setInterval(() => {
        setQuestionTime(prev => prev + 1)
      }, 1000)
      
      toast.info('Time\'s up! Moving to next question...', { 
        style: { color: '#3b82f6' } 
      })
    }
  }

  const handleSubmitAnswer = () => {
    if (!interviewPrep || !expandedQuestionId) return
    
    const currentQuestion = interviewPrep.questions.find(q => q.id === expandedQuestionId)
    if (!currentQuestion) return
    
    if (!currentAnswerText.trim()) {
      toast.error('Please provide an answer before continuing', { 
        style: { color: '#dc2626' } 
      })
      return
    }
    
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: currentAnswerText.trim(),
      timeSpent: questionTime
    }
    
    const updatedAnswers = [...userAnswers, newAnswer]
    setUserAnswers(updatedAnswers)
    
    const allAnswered = updatedAnswers.length === interviewPrep.questions.length
    
    if (allAnswered) {
      completeQuiz(updatedAnswers)
    } else {
      // Move to next question
      const currentIndex = interviewPrep.questions.findIndex(q => q.id === expandedQuestionId)
      const nextQuestion = interviewPrep.questions[currentIndex + 1]
      
      setExpandedQuestionId(nextQuestion.id)
      setCurrentAnswerText('')
      setQuestionTime(0)
      
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
      questionTimerRef.current = setInterval(() => {
        setQuestionTime(prev => prev + 1)
      }, 1000)
    }
  }

  const handleAutoSubmitQuiz = () => {
    if (!interviewPrep) return
    
    const finalAnswers: UserAnswer[] = [...userAnswers]
    
    if (expandedQuestionId && currentAnswerText.trim()) {
      const currentQuestion = interviewPrep.questions.find(q => q.id === expandedQuestionId)
      if (currentQuestion) {
        finalAnswers.push({
          questionId: currentQuestion.id,
          answer: currentAnswerText.trim(),
          timeSpent: questionTime
        })
      }
    }
    
    for (const q of interviewPrep.questions) {
      if (!finalAnswers.find(a => a.questionId === q.id)) {
        finalAnswers.push({
          questionId: q.id,
          answer: '(No answer provided - time expired)',
          timeSpent: 0
        })
      }
    }
    
    toast.error('Time\'s up! Quiz auto-submitted.', { 
      style: { color: '#dc2626' } 
    })
    
    completeQuiz(finalAnswers)
  }

  const completeQuiz = async (finalAnswers: UserAnswer[]) => {
    if (generalTimerRef.current) clearInterval(generalTimerRef.current)
    if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    
    setQuizCompleted(true)
    setExpandedQuestionId(null)
    setAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze-interview-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          questions: interviewPrep?.questions,
          answers: finalAnswers,
          totalTime: generalTime
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze answers')
      }

      const { feedback: aiFeedback } = await response.json()
      setFeedback(aiFeedback)
      
      toast.success('Analysis complete!', { style: { color: '#16a34a' } })
      
    } catch (error: any) {
      toast.error('Failed to analyze answers. Please try again.', { 
        style: { color: '#dc2626' } 
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setExpandedQuestionId(null)
    setUserAnswers([])
    setCurrentAnswerText('')
    setGeneralTime(0)
    setQuestionTime(0)
    setQuizCompleted(false)
    setFeedback(null)
    setShowTimeWarning(false)
    
    if (generalTimerRef.current) clearInterval(generalTimerRef.current)
    if (questionTimerRef.current) clearInterval(questionTimerRef.current)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavioral':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'technical':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'company-specific':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'role-specific':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-blue-600 dark:text-blue-400'
    if (score >= 55) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Application not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href={`/dashboard/applications/${applicationId}`}>
            <Button variant="ghost" className="mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Application
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Interview Preparation
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {application.job_title} at {application.company_name}
              </p>
            </div>

            {!interviewPrep && (
              <Button
                onClick={handleGeneratePrep}
                disabled={generating}
                className="text-black font-semibold rounded-xl bg-primary hover:bg-primary/90 w-full sm:w-auto"
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

        {/* General Timer (shown when quiz is active) */}
        {quizStarted && !quizCompleted && (
          <div className="mb-4 sm:mb-6 bg-card rounded-2xl shadow-sm p-4 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Total Time</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                      {formatTime(generalTime)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      of {formatTime(totalTimeLimit)}
                    </div>
                  </div>
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <span className="font-bold text-foreground text-sm sm:text-base">
                      {userAnswers.length}/{interviewPrep?.questions.length}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleStopQuiz}
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto rounded-xl"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Quiz
              </Button>
            </div>
            
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-primary"
                style={{ 
                  width: `${(generalTime / totalTimeLimit) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {!interviewPrep ? (
          <div className="bg-card rounded-3xl shadow-lg p-8 sm:p-12 border border-border text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              No Interview Prep Yet
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
              Generate AI-powered interview questions tailored to this specific role and company.
            </p>
            <Button
              onClick={handleGeneratePrep}
              disabled={generating}
              className="text-black font-semibold rounded-xl px-8 bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              {generating ? 'Generating...' : 'Generate Interview Prep'}
            </Button>
          </div>
        ) : !quizStarted ? (
          /* Quiz Start Screen */
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-3xl shadow-lg p-6 sm:p-8 border border-border">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                  Ready to Practice?
                </h2>
                
                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {interviewPrep.questions.length} Questions
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Cover behavioral, technical, and role-specific topics
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {formatTime(interviewPrep.questions.length * 150)} Total Time
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        2.5 minutes per question
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        AI Feedback
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Get detailed analysis and improvement suggestions
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={startQuiz}
                  className="w-full text-white font-semibold rounded-xl py-6 text-lg bg-primary hover:bg-primary/90"
                >
                  Start Practice Session
                </Button>
              </div>
            </div>

            {/* Sidebar - Key Topics & Tips */}
            <div className="space-y-4 sm:space-y-6">
              {interviewPrep.key_topics && interviewPrep.key_topics.length > 0 && (
                <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Key Topics</h3>
                  </div>
                  <ul className="space-y-2">
                    {interviewPrep.key_topics.map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {interviewPrep.preparation_tips && interviewPrep.preparation_tips.length > 0 && (
                <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Preparation Tips</h3>
                  </div>
                  <ul className="space-y-3">
                    {interviewPrep.preparation_tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-foreground">
                        <span className="font-medium">{idx + 1}.</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                    Get New Questions
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : quizCompleted && feedback ? (
          /* Results Screen */
          <div className="space-y-4 sm:space-y-6">
            {/* Overall Score */}
            <div className="bg-card rounded-3xl shadow-lg p-6 sm:p-8 border border-border text-center">
              <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Practice Complete!
              </h2>
              <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full my-4 sm:my-6 bg-primary/10">
                <span className={`text-4xl sm:text-5xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                  {feedback.overall_score}
                </span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Overall Performance Score
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Total time: {formatTime(generalTime)}
              </div>
            </div>

            {/* Question-by-Question Feedback */}
            <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Detailed Feedback
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                {feedback.question_feedback.map((qf, idx) => (
                  <div key={idx} className="border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <h3 className="font-semibold text-foreground flex-1 text-sm sm:text-base">
                        Q{idx + 1}: {qf.question}
                      </h3>
                      <span className={`font-bold text-lg flex-shrink-0 ${getScoreColor(qf.score)}`}>
                        {qf.score}
                      </span>
                    </div>

                    <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-foreground mb-1">Your Answer:</p>
                      <p className="text-sm text-muted-foreground">{qf.user_answer}</p>
                    </div>

                    {qf.strengths && qf.strengths.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <h4 className="font-semibold text-foreground text-sm">What You Got Right</h4>
                        </div>
                        <ul className="space-y-1 ml-6">
                          {qf.strengths.map((str, i) => (
                            <li key={i} className="text-sm text-foreground">• {str}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {qf.improvements && qf.improvements.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <h4 className="font-semibold text-foreground text-sm">Areas to Improve</h4>
                        </div>
                        <ul className="space-y-1 ml-6">
                          {qf.improvements.map((imp, i) => (
                            <li key={i} className="text-sm text-foreground">• {imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {qf.ideal_approach && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1 text-sm">
                          Ideal Approach
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{qf.ideal_approach}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* General Advice */}
            {feedback.general_advice && feedback.general_advice.length > 0 && (
              <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">General Improvement Advice</h2>
                </div>
                <ul className="space-y-3">
                  {feedback.general_advice.map((advice, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-foreground text-sm sm:text-base">
                      <span className="flex-shrink-0 mt-1 text-primary">•</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Encouragement */}
            {feedback.encouragement && (
              <div className="bg-muted/50 rounded-2xl p-4 sm:p-6 border border-border">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Keep Going!</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{feedback.encouragement}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={resetQuiz}
                className="flex-1 text-black font-semibold rounded-xl py-6 bg-primary hover:bg-primary/90"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Practice Again
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/applications/${applicationId}`)}
                variant="outline"
                className="flex-1 rounded-xl py-6"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Application
              </Button>
            </div>
          </div>
        ) : analyzing ? (
          /* Analyzing State */
          <div className="bg-card rounded-3xl shadow-lg p-8 sm:p-12 border border-border text-center">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              Analyzing Your Answers...
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Our AI is reviewing your responses and preparing detailed feedback
            </p>
          </div>
        ) : (
          /* Active Quiz - Card-based Questions */
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4">
              {interviewPrep?.questions.map((question, idx) => {
                const isAnswered = userAnswers.some(a => a.questionId === question.id)
                const isExpanded = expandedQuestionId === question.id
                const isLastQuestion = idx === interviewPrep.questions.length - 1
                
                return (
                  <div
                    key={question.id}
                    className={`bg-card rounded-2xl shadow-sm border transition-all duration-500 ease-in-out overflow-hidden ${
                      isExpanded 
                        ? 'border-primary shadow-lg' 
                        : isAnswered 
                        ? 'border-green-200 dark:border-green-800' 
                        : 'border-border'
                    }`}
                  >
                    {/* Collapsed View */}
                    {!isExpanded && (
                      <div
                        className="p-4 cursor-default hover:bg-muted/50 transition-colors rounded-2xl"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                                {question.category.replace('-', ' ')}
                              </span>
                              <span className="text-xs text-muted-foreground">Question {idx + 1}</span>
                            </div>
                            <p className="text-foreground font-medium text-sm sm:text-base">{question.question}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {isAnswered ? (
                              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="p-4 sm:p-6 animate-in slide-in-from-top duration-500">
                        {/* Question Header with Timer and Continue Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              Question {idx + 1} of {interviewPrep.questions.length}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                              {question.category.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-mono text-base sm:text-lg font-bold text-foreground">
                                {formatTime(questionTime)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                / {formatTime(questionTimeLimit)}
                              </span>
                            </div>
                            <Button
                              onClick={handleSubmitAnswer}
                              disabled={!currentAnswerText.trim()}
                              size="sm"
                              className="text-white font-semibold rounded-lg bg-primary hover:bg-primary/90"
                            >
                              <Send className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">
                                {isLastQuestion ? 'Finish' : 'Continue'}
                              </span>
                            </Button>
                          </div>
                        </div>

                        {/* Question Progress Bar */}
                        <div className="mb-4 sm:mb-6 w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300 bg-primary"
                            style={{ 
                              width: `${(questionTime / questionTimeLimit) * 100}%`
                            }}
                          />
                        </div>

                        {/* Question */}
                        <div className="mb-4 sm:mb-6 p-4 bg-muted/50 rounded-xl">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">
                            {question.question}
                          </h3>
                        </div>

                        {/* Answer Textarea */}
                        <Textarea
                          value={currentAnswerText}
                          onChange={(e) => setCurrentAnswerText(e.target.value)}
                          placeholder="Type your answer here... Use the STAR method for behavioral questions (Situation, Task, Action, Result)"
                          rows={8}
                          className="border-border focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl resize-none mb-4 text-sm sm:text-base"
                        />

                        {/* Tips */}
                        {question.tips && question.tips.length > 0 && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl mb-4 sm:mb-6">
                            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2 text-sm sm:text-base">
                              <Lightbulb className="w-4 h-4" />
                              Tips
                            </h4>
                            <ul className="space-y-1 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                              {question.tips.map((tip, tipIdx) => (
                                <li key={tipIdx}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Warning if running out of time */}
                        {questionTimeLimit - questionTime <= 30 && (
                          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-200">
                              {questionTimeLimit - questionTime <= 10 
                                ? 'Less than 10 seconds remaining!' 
                                : '30 seconds remaining for this question'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Sidebar - Key Topics & Preparation Tips */}
            <div className="space-y-4 sm:space-y-6">
              {interviewPrep?.key_topics && interviewPrep.key_topics.length > 0 && (
                <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 border border-border sticky top-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Key Topics</h3>
                  </div>
                  <ul className="space-y-2">
                    {interviewPrep.key_topics.map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {interviewPrep?.preparation_tips && interviewPrep.preparation_tips.length > 0 && (
                <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Preparation Tips</h3>
                  </div>
                  <ul className="space-y-3">
                    {interviewPrep.preparation_tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-foreground">
                        <span className="font-medium">{idx + 1}.</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}