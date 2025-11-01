// app/dashboard/companies/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { 
  Building2, 
  ExternalLink,
  Briefcase,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface CompanyPageProps {
  params: Promise<{
    slug: string
  }>
}


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
    <div className="w-full">
      {/* Back Button */}
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        <Link href="/dashboard/companies">
          <Button
            variant="ghost"
            className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Header Card */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Logo and Title */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 sm:w-10 sm:h-10 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold text-foreground break-words">
                  {company.name}
                </h1>
                
                {company.overall_rating !== null && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
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
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                      {company.overall_rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-border">
              {company.industry && (
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Industry</p>
                  <p className="text-sm sm:text-base font-medium text-foreground break-words">{company.industry}</p>
                </div>
              )}
              {company.company_size && (
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="text-sm sm:text-base font-medium text-foreground break-words">{company.company_size}</p>
                </div>
              )}
              {company.headquarters && (
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm sm:text-base font-medium text-foreground break-words">{company.headquarters}</p>
                </div>
              )}
              {company.founded_year && (
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Founded</p>
                  <p className="text-sm sm:text-base font-medium text-foreground">{company.founded_year}</p>
                </div>
              )}
            </div>

            {/* Website Button */}
            {company.website && (
              <div className="pt-2 sm:pt-4 border-t border-border">
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:opacity-90">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {company.description && (
        <div className="px-4 sm:px-6 pb-6">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">About</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{company.description}</p>
          </div>
        </div>
      )}

      {/* Culture */}
      {company.culture_summary && (
        <div className="px-4 sm:px-6 pb-6">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">Company Culture</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{company.culture_summary}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="px-4 sm:px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pros & Cons */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-6">Employee Insights</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pros */}
              {prosArray.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">Pros</h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3">
                    {prosArray.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="text-green-600 flex-shrink-0 mt-0.5">+</span>
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
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">Cons</h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3">
                    {consArray.map((con, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="text-red-600 flex-shrink-0 mt-0.5">-</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Info Sidebar */}
        <div>
          <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Quick Info</h3>
            <div className="space-y-4 text-xs sm:text-sm">
              {company.industry && (
                <div>
                  <p className="text-muted-foreground mb-1">Industry</p>
                  <p className="text-foreground font-medium">{company.industry}</p>
                </div>
              )}
              {company.company_size && (
                <div>
                  <p className="text-muted-foreground mb-1">Company Size</p>
                  <p className="text-foreground font-medium">{company.company_size}</p>
                </div>
              )}
              {company.headquarters && (
                <div>
                  <p className="text-muted-foreground mb-1">Headquarters</p>
                  <p className="text-foreground font-medium">{company.headquarters}</p>
                </div>
              )}
              {company.last_researched_at && (
                <div>
                  <p className="text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-foreground font-medium">{formatDate(company.last_researched_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Applications */}
      {applications && applications.length > 0 && (
        <div className="px-4 sm:px-6 pb-6">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Your Applications ({applications.length})
              </h2>
            </div>
            
            <div className="space-y-3">
              {applications.map((app) => (
                <Link 
                  key={app.id}
                  href={`/dashboard/applications/${app.id}`}
                  className="block p-3 sm:p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/5 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-medium text-foreground break-words flex-1">
                        {app.job_title}
                      </h3>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium flex-shrink-0 whitespace-nowrap
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
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Added {formatDate(app.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* External Links */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Research More</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full rounded-lg border-border hover:bg-accent text-xs sm:text-sm py-2">
                  <ExternalLink className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="hidden sm:inline">Website</span>
                  <span className="sm:hidden">Site</span>
                </Button>
              </a>
            )}
            {company.linkedin_url && (
              <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full rounded-lg border-border hover:bg-accent text-xs sm:text-sm py-2">
                  <ExternalLink className="w-4 h-4 mr-1 flex-shrink-0" />
                  LinkedIn
                </Button>
              </a>
            )}
            {company.glassdoor_url && (
              <a href={company.glassdoor_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full rounded-lg border-border hover:bg-accent text-xs sm:text-sm py-2">
                  <ExternalLink className="w-4 h-4 mr-1 flex-shrink-0" />
                  Glassdoor
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}