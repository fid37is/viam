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

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <form onSubmit={handleSavePreferences} className="space-y-6">
      {/* Career Values */}
      <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-border">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Career Values</h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6">
          Select up to 5 values (currently {selectedValues.length} selected)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
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
                  p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border-2 text-left transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : isDisabled
                    ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
                style={isSelected ? { borderColor: 'hsl(var(--primary))' } : {}}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-0.5 sm:mb-1 break-words">
                      {value.label}
                    </h3>
                    <p className="text-xs sm:text-xs md:text-sm text-muted-foreground break-words">
                      {value.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div 
                      className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ml-2 flex-shrink-0"
                      style={{ backgroundColor: 'hsl(var(--primary))' }}
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-border">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Deal Breakers</h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6">
          Select things you want to avoid (optional)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {DEAL_BREAKERS.map((dealBreaker) => {
            const isSelected = selectedDealBreakers.includes(dealBreaker.id)

            return (
              <button
                key={dealBreaker.id}
                type="button"
                onClick={() => toggleDealBreaker(dealBreaker.id)}
                className={`
                  p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border-2 text-left transition-all
                  ${isSelected
                    ? 'border-destructive bg-destructive/5 shadow-sm'
                    : 'border-border hover:border-destructive/50 hover:bg-muted/30'
                  }
                `}
                style={isSelected ? { borderColor: 'hsl(var(--destructive))' } : {}}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-0.5 sm:mb-1 break-words">
                      {dealBreaker.label}
                    </h3>
                    <p className="text-xs sm:text-xs md:text-sm text-muted-foreground break-words">
                      {dealBreaker.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div 
                      className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ml-2 flex-shrink-0"
                      style={{ backgroundColor: 'hsl(var(--destructive))' }}
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-destructive-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Work Location */}
      <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-border">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Work Location</h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6">
          Your preferred work arrangement
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {WORK_LOCATIONS.map((location) => {
            const isSelected = workLocation === location.id

            return (
              <button
                key={location.id}
                type="button"
                onClick={() => setWorkLocation(location.id)}
                className={`
                  p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl border-2 text-center transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
                style={isSelected ? { borderColor: 'hsl(var(--primary))' } : {}}
              >
                <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-1 sm:mb-1.5 break-words">
                  {location.label}
                </h3>
                <p className="text-xs sm:text-xs md:text-sm text-muted-foreground break-words">
                  {location.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Company Size */}
      <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-border">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Company Size</h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6">
          Preferred company sizes (optional)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
          {COMPANY_SIZES.map((size) => {
            const isSelected = companySize.includes(size.id)

            return (
              <button
                key={size.id}
                type="button"
                onClick={() => toggleCompanySize(size.id)}
                className={`
                  p-2 sm:p-2.5 md:p-4 rounded-lg sm:rounded-lg md:rounded-xl border-2 text-center transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
                style={isSelected ? { borderColor: 'hsl(var(--primary))' } : {}}
              >
                <div className="text-xs sm:text-xs md:text-sm font-semibold text-foreground mb-0.5 sm:mb-1 break-words">
                  {size.label}
                </div>
                <div className="text-xs md:text-xs text-muted-foreground break-words">
                  {size.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Industries */}
      <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-border">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Industries of Interest</h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6">
          Industries you'd like to work in (optional)
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3">
          {INDUSTRIES.map((industry) => {
            const isSelected = industries.includes(industry.id)

            return (
              <button
                key={industry.id}
                type="button"
                onClick={() => toggleIndustry(industry.id)}
                className={`
                  p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-lg md:rounded-xl border-2 text-center transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
                style={isSelected ? { borderColor: 'hsl(var(--primary))' } : {}}
              >
                <div className="text-xs sm:text-xs md:text-sm font-semibold text-foreground break-words">
                  {industry.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="h-9 sm:h-10 md:h-12 px-6 sm:px-8 bg-primary text-primary-foreground font-semibold rounded-lg sm:rounded-xl hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-spin mr-1.5 sm:mr-2" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </form>
  )
}