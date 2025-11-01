// app/dashboard/companies/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { 
  Building2, 
  MapPin, 
  Users, 
  TrendingUp, 
  ExternalLink,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Database } from '@/lib/supabase/types'

interface CompanyPageProps {
  params: Promise<{
    slug: string
  }>
}

type Company = Database['public']['Tables']['companies']['Row']
type Application = Database['public']['Tables']['applications']['Row']

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Get company data
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !company) {
    notFound()
  }

  // Get all applications to this company
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  // Type-safe array checks
  const prosArray = Array.isArray(company.pros) ? company.pros as string[] : []
  const consArray = Array.isArray(company.cons) ? company.cons as string[] : []

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Back Button */}
      <Link href="/dashboard/companies">
        <Button
          variant="ghost"
          className="mb-6 text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Companies
        </Button>
      </Link>

      {/* Header */}
      <div className="bg-card rounded-3xl shadow-lg p-8 border border-border mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            {/* Company Logo */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-12 h-12 text-muted-foreground" />
            </div>

            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                {company.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {company.industry && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{company.industry}</span>
                  </div>
                )}
                {company.company_size && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{company.company_size}</span>
                  </div>
                )}
                {company.headquarters && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{company.headquarters}</span>
                  </div>
                )}
                {company.founded_year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Founded {company.founded_year}</span>
                  </div>
                )}
              </div>

              {company.overall_rating !== null && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(company.overall_rating!)
                            ? 'text-yellow-400 fill-current'
                            : 'text-muted-foreground/30'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-muted-foreground font-medium">
                    {company.overall_rating.toFixed(1)} / 5.0
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Website Link */}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button
                variant="outline"
                className="rounded-xl border-border hover:bg-accent hover:text-accent-foreground"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </a>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
            <p className="text-muted-foreground leading-relaxed">{company.description}</p>
          </div>
        )}

        {/* Culture Summary */}
        {company.culture_summary && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Company Culture</h2>
            <p className="text-muted-foreground leading-relaxed">{company.culture_summary}</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pros & Cons */}
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-6">Employee Insights</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pros */}
              {prosArray.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-foreground">Pros</h3>
                  </div>
                  <ul className="space-y-3">
                    {prosArray.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-green-600 mt-0.5">+</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cons */}
              {consArray.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-foreground">Cons</h3>
                  </div>
                  <ul className="space-y-3">
                    {consArray.map((con, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-red-600 mt-0.5">-</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Your Applications */}
          {applications && applications.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                  Your Applications ({applications.length})
                </h2>
              </div>
              
              <div className="space-y-3">
                {applications.map((app) => (
                  <Link 
                    key={app.id}
                    href={`/dashboard/applications/${app.id}`}
                    className="block p-4 rounded-xl border border-border hover:border-primary hover:bg-accent/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground mb-1">
                          {app.job_title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Added {formatDate(app.created_at)}
                        </p>
                      </div>
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${app.status === 'interviewing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          app.status === 'offer' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          app.status === 'applied' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-muted text-muted-foreground'
                        }
                      `}>
                        {(app.status ?? 'unknown').replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Industry</p>
                <p className="text-foreground font-medium">{company.industry || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Company Size</p>
                <p className="text-foreground font-medium">{company.company_size || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Headquarters</p>
                <p className="text-foreground font-medium">{company.headquarters || 'Not specified'}</p>
              </div>
              {company.last_researched_at && (
                <div>
                  <p className="text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-foreground font-medium">{formatDate(company.last_researched_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* External Links */}
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Research More</h3>
            <div className="space-y-2">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start rounded-xl border-border hover:bg-accent hover:text-accent-foreground">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Official Website
                  </Button>
                </a>
              )}
              {company.linkedin_url && (
                <a
                  href={company.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start rounded-xl border-border hover:bg-accent hover:text-accent-foreground">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                </a>
              )}
              {company.glassdoor_url && (
                <a
                  href={company.glassdoor_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start rounded-xl border-border hover:bg-accent hover:text-accent-foreground">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Glassdoor
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}