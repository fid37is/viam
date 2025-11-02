'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Settings, Mail, Briefcase, CheckCircle, Trash2, Moon, Sun, Monitor } from 'lucide-react'
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

  const [activeTab, setActiveTab] = useState<'account' | 'preferences'>('account')
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteChoice, setDeleteChoice] = useState<'hibernate' | 'delete' | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

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

      toast.success('Account updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update account')
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

      toast.success('Preferences updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteChoice) return

    setLoading(true)
    try {
      if (deleteChoice === 'hibernate') {
        // Mark account as hibernated
        const { error } = await supabase
          .from('profiles')
          .update({ account_status: 'hibernated' })
          .eq('id', user.id)

        if (error) throw error
        toast.success('Account hibernated. You can reactivate it anytime!')
      } else {
        // Mark for deletion (30-day grace period)
        const deletionDate = new Date()
        deletionDate.setDate(deletionDate.getDate() + 30)

        const { error } = await supabase
          .from('profiles')
          .update({
            account_status: 'deleted',
            deletion_scheduled_at: deletionDate.toISOString(),
          })
          .eq('id', user.id)

        if (error) throw error
        toast.success('Account scheduled for deletion in 30 days. You can reactivate it until then.')
      }

      setShowDeleteDialog(false)
      setDeleteChoice(null)

      // Sign out after action
      setTimeout(() => {
        supabase.auth.signOut()
        router.push('/')
      }, 1500)
    } catch (err: any) {
      toast.error(err.message || 'Failed to process account action')
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

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    
    if (selectedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else if (selectedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    setTheme(selectedTheme)
    localStorage.setItem('theme', selectedTheme)
    toast.success(`Theme set to ${selectedTheme}`)
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-2 inline-flex">
        <button
          onClick={() => setActiveTab('account')}
          className={`
            px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all
            ${activeTab === 'account'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
            }
          `}
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
          Account
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`
            px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all
            ${activeTab === 'preferences'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
            }
          `}
        >
          <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
          Preferences
        </button>
      </div>

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Account Info Card */}
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-border">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6">Account Information</h2>
            
            <form onSubmit={handleSaveAccount} className="space-y-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="text-xs sm:text-sm md:text-base text-foreground font-semibold">
                  Full Name
                </Label>
                <div className="relative mt-2">
                  <Settings className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="h-9 sm:h-10 md:h-12 pl-9 sm:pl-10 border-border focus:border-transparent focus:ring-2 focus:ring-ring rounded-lg sm:rounded-xl bg-background text-xs sm:text-sm md:text-base text-foreground"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm md:text-base text-foreground font-semibold">
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="h-9 sm:h-10 md:h-12 pl-9 sm:pl-10 border-border bg-muted rounded-lg sm:rounded-xl cursor-not-allowed text-xs sm:text-sm md:text-base text-muted-foreground"
                  />
                </div>
                <p className="text-xs sm:text-xs md:text-sm text-muted-foreground mt-2">
                  Email cannot be changed
                </p>
              </div>

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
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Theme Settings Card */}
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Appearance</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Choose your theme preference</p>
              </div>
              
              <div className="bg-muted rounded-lg sm:rounded-xl p-1 inline-flex gap-1">
                <button
                  onClick={() => applyTheme('light')}
                  className={`p-2 sm:p-2.5 rounded-lg transition-all ${
                    theme === 'light'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-background'
                  }`}
                  title="Light theme"
                >
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => applyTheme('dark')}
                  className={`p-2 sm:p-2.5 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-background'
                  }`}
                  title="Dark theme"
                >
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => applyTheme('system')}
                  className={`p-2 sm:p-2.5 rounded-lg transition-all ${
                    theme === 'system'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-background'
                  }`}
                  title="System theme"
                >
                  <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Delete Account Card */}
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-destructive/20">
            <h2 className="text-lg sm:text-xl font-semibold text-destructive mb-2">Danger Zone</h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              className="h-9 sm:h-10 md:h-12 px-6 sm:px-8 bg-destructive text-destructive-foreground font-semibold rounded-lg sm:rounded-xl hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      )}

      {/* Job Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="space-y-6">
          {/* Values */}
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
                      p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/5'
                        : isDisabled
                        ? 'border-border bg-muted opacity-50 cursor-not-allowed'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm md:text-base font-medium text-foreground">{value.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-2">
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary-foreground" />
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
              Select things you want to avoid
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
                      p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all
                      ${isSelected
                        ? 'border-destructive bg-destructive/5'
                        : 'border-border hover:border-destructive/50 hover:bg-muted'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm md:text-base font-medium text-foreground">{dealBreaker.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-destructive flex items-center justify-center flex-shrink-0 ml-2">
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-destructive-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Work Location Preference */}
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-border">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Work Location</h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6">
              Your preferred work arrangement
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {WORK_LOCATIONS.map((location) => {
                const isSelected = workLocation === location.id

                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => setWorkLocation(location.id)}
                    className={`
                      p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border-2 text-center transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                      }
                    `}
                  >
                    <span className="text-xs sm:text-sm md:text-base font-medium text-foreground">{location.label}</span>
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
      )}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-border">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Delete Account</h3>
            
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6">
              What would you like to do with your account?
            </p>

            <div className="space-y-3 mb-8">
              {/* Hibernate Option */}
              <button
                onClick={() => setDeleteChoice('hibernate')}
                className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all ${
                  deleteChoice === 'hibernate'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <p className="font-semibold text-xs sm:text-sm md:text-base text-foreground">Hibernate Account</p>
                <p className="text-xs text-muted-foreground mt-1">Temporarily disable your account. You can reactivate it anytime.</p>
              </button>

              {/* Permanent Delete Option */}
              <button
                onClick={() => setDeleteChoice('delete')}
                className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all ${
                  deleteChoice === 'delete'
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border hover:border-destructive/50 hover:bg-muted'
                }`}
              >
                <p className="font-semibold text-xs sm:text-sm md:text-base text-destructive">Delete Account (30-day grace)</p>
                <p className="text-xs text-muted-foreground mt-1">Permanently delete your account. You have 30 days to change your mind.</p>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => {
                  setShowDeleteDialog(false)
                  setDeleteChoice(null)
                }}
                variant="outline"
                className="flex-1 h-9 sm:h-10 md:h-12 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={!deleteChoice || loading}
                className="flex-1 h-9 sm:h-10 md:h-12 bg-destructive text-destructive-foreground rounded-lg sm:rounded-xl hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  'Confirm'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}