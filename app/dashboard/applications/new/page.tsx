import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddApplicationForm from '@/components/applications/add-application-form'
import { Zap, CheckCircle, BarChart3, Clock, Sparkles, ArrowRight } from 'lucide-react'

export default async function NewApplicationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Add New Application
        </h1>
        <p className="text-muted-foreground">
          Paste a job URL and we'll extract the details automatically
        </p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Side - Instructions */}
        <div className="lg:col-span-1 space-y-4">
          {/* How It Works */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">How It Works</h2>
            </div>

            <ol className="space-y-4">
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Paste the job URL</p>
                  <p className="text-xs text-muted-foreground mt-1">From LinkedIn, Indeed, or any job board</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">We extract the details</p>
                  <p className="text-xs text-muted-foreground mt-1">Job title, company, location automatically</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Get AI insights</p>
                  <p className="text-xs text-muted-foreground mt-1">Match score, strengths, recommendations</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Save to dashboard</p>
                  <p className="text-xs text-muted-foreground mt-1">Track and manage all your applications</p>
                </div>
              </li>
            </ol>
          </div>

          {/* What You Can Do */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Next Steps</h3>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <BarChart3 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">View your match score instantly</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">Track application dates & deadlines</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">Generate interview prep questions</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">Get company insights & research</span>
              </li>
            </ul>
          </div>

          {/* Pro Tip */}
          <div className="bg-secondary/5 rounded-xl border border-secondary/20 p-4">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">💡 Pro Tip</p>
            <p className="text-sm text-foreground">
              Including the full job description helps us provide more accurate match analysis and interview prep questions.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:col-span-2">
          <AddApplicationForm userId={user.id} />
        </div>
      </div>
    </div>
  )
}