'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Settings, Mail, Briefcase, CheckCircle, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/lib/supabase/types'
import type { User } from '@supabase/supabase-js'

interface ProfileSettingsProps {
  profile: Profile | null
  user: User
}

const VALUES = [
  { id: 'mission-driven', label: 'Mission-Driven Work' },
  { id: 'work-life-balance', label: 'Work-Life Balance' },
  { id: 'high-compensation', label: 'High Compensation' },
  { id: 'career-growth', label: 'Career Growth' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'dei-commitment', label: 'DEI Commitment' },
  { id: 'remote-work', label: 'Remote Work' },
  { id: 'team-culture', label: 'Team Culture' },
  { id: 'learning-opportunities', label: 'Learning & Development' },
  { id: 'impact', label: 'Direct Impact' },
  { id: 'job-security', label: 'Job Security' },
  { id: 'autonomy', label: 'Autonomy' },
]

const DEAL_BREAKERS = [
  { id: 'no-remote', label: 'No Remote Options' },
  { id: 'long-hours', label: 'Long Hours' },
  { id: 'poor-dei', label: 'Poor DEI Record' },
  { id: 'unclear-mission', label: 'Unclear Mission' },
  { id: 'low-growth', label: 'Limited Growth' },
  { id: 'micromanagement', label: 'Micromanagement' },
  { id: 'poor-reviews', label: 'Poor Employee Reviews' },
  { id: 'unstable-funding', label: 'Unstable Funding' },
  { id: 'toxic-culture', label: 'Toxic Culture' },
  { id: 'no-benefits', label: 'Limited Benefits' },
]

const WORK_LOCATIONS = [
  { id: 'remote', label: 'Fully Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'office', label: 'In Office' },
  { id: 'flexible', label: 'Flexible' },
]

export default function ProfileSettings({ profile, user }: ProfileSettingsProps) {
  const supabase = createClient()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'billing'>('account')
  const [loading, setLoading] = useState(false)

  // Account fields
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [email] = useState(user.email || '')

  // Preferences
  const [selectedValues, setSelectedValues] = useState<string[]>(
    (profile?.top_values as string[]) || []
  )
  const [selectedDealBreakers, setSelectedDealBreakers] = useState<string[]>(
    (profile?.deal_breakers as string[]) || []
  )
  const [workLocation, setWorkLocation] = useState(profile?.work_location_preference || '')

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Account updated successfully!', { style: { color: '#16a34a' } })
    } catch (err: any) {
      toast.error(err.message, { style: { color: '#dc2626' } })
    } finally {
      setLoading(false)
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
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Preferences updated successfully!', { style: { color: '#16a34a' } })
    } catch (err: any) {
      toast.error(err.message, { style: { color: '#dc2626' } })
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-2 inline-flex">
        <button
          onClick={() => setActiveTab('account')}
          className={`
            px-6 py-3 rounded-xl text-sm font-medium transition-all
            ${activeTab === 'account'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
            }
          `}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Account
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`
            px-6 py-3 rounded-xl text-sm font-medium transition-all
            ${activeTab === 'preferences'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
            }
          `}
        >
          <Briefcase className="w-4 h-4 inline mr-2" />
          Job Preferences
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`
            px-6 py-3 rounded-xl text-sm font-medium transition-all
            ${activeTab === 'billing'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
            }
          `}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Billing
        </button>
      </div>

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Account Information</h2>
          
          <form onSubmit={handleSaveAccount} className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-foreground font-medium">
                Full Name
              </Label>
              <div className="relative mt-2">
                <Settings className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="h-12 pl-10 border-border focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl bg-background text-foreground"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="h-12 pl-10 border-border bg-muted rounded-xl cursor-not-allowed text-muted-foreground"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Email cannot be changed
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Job Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="space-y-6">
          {/* Values */}
          <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">Career Values</h2>
            <p className="text-muted-foreground mb-6">
              Select up to 5 values (currently {selectedValues.length} selected)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/10'
                        : isDisabled
                        ? 'border-border bg-muted opacity-50 cursor-not-allowed'
                        : 'border-border hover:border-muted-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{value.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Deal Breakers */}
          <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">Deal Breakers</h2>
            <p className="text-muted-foreground mb-6">
              Select things you want to avoid
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEAL_BREAKERS.map((dealBreaker) => {
                const isSelected = selectedDealBreakers.includes(dealBreaker.id)

                return (
                  <button
                    key={dealBreaker.id}
                    type="button"
                    onClick={() => toggleDealBreaker(dealBreaker.id)}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected
                        ? 'border-destructive bg-destructive/10'
                        : 'border-border hover:border-muted-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{dealBreaker.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-destructive-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Work Location Preference */}
          <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">Work Location</h2>
            <p className="text-muted-foreground mb-6">
              Your preferred work arrangement
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WORK_LOCATIONS.map((location) => {
                const isSelected = workLocation === location.id

                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => setWorkLocation(location.id)}
                    className={`
                      p-4 rounded-xl border-2 text-center transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <span className="font-medium text-foreground">{location.label}</span>
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
              className="h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Billing */}
      {activeTab === 'billing' && (
        <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-2">Billing & Subscription</h2>
          <p className="text-muted-foreground mb-8">
            Manage your subscription plan and billing information
          </p>

          <button
            onClick={() => router.push('/billing')}
            className="inline-flex items-center gap-2 h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <CreditCard className="w-5 h-5" />
            Go to Billing
          </button>
        </div>
      )}
    </div>
  )
}