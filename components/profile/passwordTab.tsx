'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff, Shield, Lock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

interface PasswordTabProps {
  user: User
}

export default function PasswordTab({ user }: PasswordTabProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword,
      })

      if (signInError) {
        toast.error('Current password is incorrect')
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-border">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6">Change Password</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Security Tips */}
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl border border-border">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Security Best Practices</h3>
              <p className="text-xs text-muted-foreground">
                Keep your account secure by following these recommendations.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Use a strong password</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  At least 12 characters with a mix of letters, numbers, and symbols
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Make it unique</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Don't reuse passwords from other accounts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Update regularly</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Change your password every 3-6 months for better security
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Avoid common patterns</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Stay away from birthdays, names, or simple sequences
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your password is encrypted and secure. We never store passwords in plain text.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Password Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="current-pwd" className="text-xs sm:text-sm font-semibold text-foreground block mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                id="current-pwd"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 md:h-11 w-full pl-4 pr-10 border border-border focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl text-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg"
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new-pwd" className="text-xs sm:text-sm font-semibold text-foreground block mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-pwd"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 md:h-11 w-full pl-4 pr-10 border border-border focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl text-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirm-pwd" className="text-xs sm:text-sm font-semibold text-foreground block mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm-pwd"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 md:h-11 w-full pl-4 pr-10 border border-border focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl text-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full h-10 md:h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm mt-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Change Password'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}