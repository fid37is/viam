'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile } from '@/lib/supabase/types'
import type { User } from '@supabase/supabase-js'

interface PreferencesTabProps {
  profile: Profile | null
  user: User
}

const VALUES = [
  { id: 'mission-driven', label: 'Mission-Driven Work', description: 'Work that makes a difference' },
  { id: 'work-life-balance', label: 'Work-Life Balance', description: 'Time for life outside work' },
  { id: 'high-compensation', label: 'High Compensation', description: 'Competitive salary and benefits' },
  { id: 'career-growth', label: 'Career Growth', description: 'Clear advancement opportunities' },
  { id: 'innovation', label: 'Innovation', description: 'Cutting-edge technology and ideas' },
  { id: 'dei-commitment', label: 'DEI Commitment', description: 'Diversity, equity, and inclusion' },
  { id: 'remote-work', label: 'Remote Work', description: 'Location flexibility' },
  { id: 'team-culture', label: 'Team Culture', description: 'Collaborative and supportive team' },
  { id: 'learning-opportunities', label: 'Learning & Development', description: 'Continuous learning culture' },
  { id: 'impact', label: 'Direct Impact', description: 'See results of your work quickly' },
  { id: 'job-security', label: 'Job Security', description: 'Stable and established company' },
  { id: 'autonomy', label: 'Autonomy', description: 'Freedom to work your way' },
]

const DEAL_BREAKERS = [
  { id: 'no-remote', label: 'No Remote Options', description: 'Must work in office full-time' },
  { id: 'long-hours', label: 'Long Hours', description: 'Consistent overtime expected' },
  { id: 'poor-dei', label: 'Poor DEI Record', description: 'Lack of diversity and inclusion' },
  { id: 'unclear-mission', label: 'Unclear Mission', description: 'No clear purpose or values' },
  { id: 'low-growth', label: 'Limited Growth', description: 'Few advancement opportunities' },
  { id: 'micromanagement', label: 'Micromanagement', description: 'Overly controlling management' },
  { id: 'poor-reviews', label: 'Poor Employee Reviews', description: 'Consistently negative feedback' },
  { id: 'unstable-funding', label: 'Unstable Funding', description: 'Financial uncertainty' },
  { id: 'toxic-culture', label: 'Toxic Culture', description: 'Unhealthy work environment' },
  { id: 'no-benefits', label: 'Limited Benefits', description: 'Poor health/retirement benefits' },
]

const WORK_LOCATIONS = [
  { id: 'remote', label: 'Fully Remote', description: 'Work from anywhere' },
  { id: 'hybrid', label: 'Hybrid', description: 'Mix of office and remote' },
  { id: 'office', label: 'In Office', description: 'On-site work' },
  { id: 'flexible', label: 'Flexible', description: 'Open to any arrangement' },
]

const COMPANY_SIZES = [
  { id: 'startup', label: 'Startup', description: '1-50 employees' },
  { id: 'scale-up', label: 'Scale-up', description: '51-500 employees' },
  { id: 'mid-size', label: 'Mid-size', description: '501-5000 employees' },
  { id: 'enterprise', label: 'Enterprise', description: '5000+ employees' },
]

const INDUSTRIES = [
  { id: 'technology', label: 'Technology' },
  { id: 'finance', label: 'Finance' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'retail', label: 'Retail' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'consulting', label: 'Consulting' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'nonprofit', label: 'Non-Profit' },
]

const MANAGEMENT_STYLES = [
  { id: 'hands-off', label: 'Hands-off', description: 'Autonomous decision making' },
  { id: 'collaborative', label: 'Collaborative', description: 'Team-based approach' },
  { id: 'mentorship', label: 'Mentorship', description: 'Guidance and development' },
  { id: 'results-oriented', label: 'Results-Oriented', description: 'Focus on outcomes' },
]

export default function PreferencesTab({ profile, user }: PreferencesTabProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [selectedValues, setSelectedValues] = useState<string[]>(
    (profile?.top_values as string[]) || []
  )
  const [selectedDealBreakers, setSelectedDealBreakers] = useState<string[]>(
    (profile?.deal_breakers as string[]) || []
  )
  const [workLocation, setWorkLocation] = useState(profile?.work_location_preference || '')
  const [companySize, setCompanySize] = useState<string[]>(
    profile?.preferred_company_size || []
  )
  const [industries, setIndustries] = useState<string[]>(
    profile?.preferred_industries || []
  )
  const [managementStyle, setManagementStyle] = useState(profile?.management_style_preference || '')
  const [shortTermGoal, setShortTermGoal] = useState(profile?.short_term_goal || '')
  const [longTermGoal, setLongTermGoal] = useState(profile?.long_term_goal || '')
  const [careerGoals, setCareerGoals] = useState(profile?.career_goals || '')

  const toggleValue = (valueId: string) => {
    if (selectedValues.includes(valueId)) {
      setSelectedValues(selectedValues.filter(id => id !== valueId))
    } else {
      if (selectedValues.length < 5) {
        setSelectedValues([...selectedValues, valueId])
      }
    }
  }

  const toggleDealBreaker = (id: string) => {
    if (selectedDealBreakers.includes(id)) {
      setSelectedDealBreakers(selectedDealBreakers.filter(item => item !== id))
    } else {
      setSelectedDealBreakers([...selectedDealBreakers, id])
    }
  }

  const toggleCompanySize = (id: string) => {
    if (companySize.includes(id)) {
      setCompanySize(companySize.filter(item => item !== id))
    } else {
      setCompanySize([...companySize, id])
    }
  }

  const toggleIndustry = (id: string) => {
    if (industries.includes(id)) {
      setIndustries(industries.filter(item => item !== id))
    } else {
      setIndustries([...industries, id])
    }
  }

  const handleSavePreferences = async () => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          top_values: selectedValues,
          deal_breakers: selectedDealBreakers,
          work_location_preference: workLocation,
          preferred_company_size: companySize,
          preferred_industries: industries,
          management_style_preference: managementStyle,
          short_term_goal: shortTermGoal,
          long_term_goal: longTermGoal,
          career_goals: careerGoals,
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Preferences updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Career Goals Section */}
      <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-1">Career Goals</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Define your professional aspirations and direction
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="short-term" className="block text-sm font-medium text-foreground mb-2">
              Short-term Goal (1-2 years)
            </label>
            <textarea
              id="short-term"
              value={shortTermGoal}
              onChange={(e) => setShortTermGoal(e.target.value)}
              placeholder="e.g., Master React and TypeScript, lead a project team"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              rows={2}
            />
          </div>

          <div>
            <label htmlFor="long-term" className="block text-sm font-medium text-foreground mb-2">
              Long-term Goal (3-5 years)
            </label>
            <textarea
              id="long-term"
              value={longTermGoal}
              onChange={(e) => setLongTermGoal(e.target.value)}
              placeholder="e.g., Become a Senior Engineering Manager, start own tech company"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              rows={2}
            />
          </div>

          <div>
            <label htmlFor="career-goals" className="block text-sm font-medium text-foreground mb-2">
              Overall Career Vision
            </label>
            <textarea
              id="career-goals"
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              placeholder="e.g., Build impactful products that solve real problems while maintaining work-life balance"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Career Values */}
      <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-1">Career Values</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Select up to 5 values ({selectedValues.length}/5 selected)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {VALUES.map((value) => {
            const isSelected = selectedValues.includes(value.id)
            const isDisabled = !isSelected && selectedValues.length >= 5

            return (
              <button
                key={value.id}
                type="button"
                onClick={() => toggleValue(value.id)}
                disabled={isDisabled}
                className={`
                  group relative p-3 rounded-lg border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-primary bg-primary/5'
                    : isDisabled
                    ? 'border-border/50 bg-muted/30 opacity-50 cursor-not-allowed'
                    : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground mb-0.5 leading-snug">
                      {value.label}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {value.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Deal Breakers */}
      <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-1">Deal Breakers</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Select factors you want to avoid
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {DEAL_BREAKERS.map((dealBreaker) => {
            const isSelected = selectedDealBreakers.includes(dealBreaker.id)

            return (
              <button
                key={dealBreaker.id}
                type="button"
                onClick={() => toggleDealBreaker(dealBreaker.id)}
                className={`
                  group relative p-3 rounded-lg border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border/50 hover:border-destructive/40 hover:bg-muted/50'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground mb-0.5 leading-snug">
                      {dealBreaker.label}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {dealBreaker.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-destructive-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Work Preferences Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Work Location */}
        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-1">Work Location</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Your preferred arrangement
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {WORK_LOCATIONS.map((location) => {
              const isSelected = workLocation === location.id

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setWorkLocation(location.id)}
                  className={`
                    p-3 rounded-lg border-2 text-center transition-all duration-200
                    ${isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                    }
                  `}
                >
                  <h3 className="font-medium text-sm text-foreground mb-0.5">
                    {location.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {location.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Management Style */}
        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-1">Management Style</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Preferred leadership approach
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {MANAGEMENT_STYLES.map((style) => {
              const isSelected = managementStyle === style.id

              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setManagementStyle(style.id)}
                  className={`
                    p-3 rounded-lg border-2 text-center transition-all duration-200
                    ${isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                    }
                  `}
                >
                  <h3 className="font-medium text-sm text-foreground mb-0.5">
                    {style.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {style.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Company Size */}
      <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-1">Company Size</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Preferred organization sizes
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COMPANY_SIZES.map((size) => {
            const isSelected = companySize.includes(size.id)

            return (
              <button
                key={size.id}
                type="button"
                onClick={() => toggleCompanySize(size.id)}
                className={`
                  p-3 rounded-lg border-2 text-center transition-all duration-200
                  ${isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                  }
                `}
              >
                <div className="font-medium text-sm text-foreground mb-0.5">
                  {size.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {size.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Industries */}
      <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-1">Industries of Interest</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Sectors you'd like to explore
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {INDUSTRIES.map((industry) => {
            const isSelected = industries.includes(industry.id)

            return (
              <button
                key={industry.id}
                type="button"
                onClick={() => toggleIndustry(industry.id)}
                className={`
                  px-3 py-2.5 rounded-lg border-2 text-center transition-all duration-200
                  ${isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                  }
                `}
              >
                <div className="text-sm font-medium text-foreground">
                  {industry.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSavePreferences}
          disabled={loading}
          className="h-11 px-8 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  )
}