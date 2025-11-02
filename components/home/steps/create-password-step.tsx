// ============================================================
// FILE: app/components/auth/steps/create-password-step.tsx
// ============================================================

'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface CreatePasswordStepProps {
  email: string
  password: string
  confirmPassword: string
  showPassword: boolean
  showConfirmPassword: boolean
  loading: boolean
  onPasswordChange: (password: string) => void
  onConfirmPasswordChange: (password: string) => void
  onShowPasswordChange: (show: boolean) => void
  onShowConfirmPasswordChange: (show: boolean) => void
  onSuccess: () => void
  onLoading: (state: boolean) => void
  intentUpgrade: boolean
}

export default function CreatePasswordStep({
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  loading,
  onPasswordChange,
  onConfirmPasswordChange,
  onShowPasswordChange,
  onShowConfirmPasswordChange,
  onSuccess,
  onLoading,
  intentUpgrade,
}: CreatePasswordStepProps) {
  const supabase = createClient()

  const handleCreateAccount = async () => {
    if (!password) {
      toast.error('Please enter a password')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    onLoading(true)

    try {
      const baseRedirect = `${window.location.origin}/auth/callback`
      const redirectUrl = intentUpgrade
        ? `${baseRedirect}?redirect=/subscription&new_user=true`
        : `${baseRedirect}?new_user=true`

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { intent_upgrade: intentUpgrade },
        },
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('This email is already registered. Please sign in instead.')
        } else {
          throw error
        }
      } else {
        onSuccess()
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <Label htmlFor="create-password" className="text-sm sm:text-base text-foreground font-medium">
          Create password
        </Label>
        <div className="relative">
          <Input
            id="create-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••"
            className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl pr-10 sm:pr-12"
            disabled={loading}
            autoFocus
          />
          <button
            type="button"
            onClick={() => onShowPasswordChange(!showPassword)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 mt-0.5 p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            )}
          </button>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
          Must be at least 6 characters
        </p>
      </div>

      <div>
        <Label htmlFor="confirm-create-password" className="text-sm sm:text-base text-foreground font-medium">
          Confirm password
        </Label>
        <div className="relative">
          <Input
            id="confirm-create-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="••••••••"
            className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl pr-10 sm:pr-12"
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
          />
          <button
            type="button"
            onClick={() => onShowConfirmPasswordChange(!showConfirmPassword)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 mt-0.5 p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <Button
        onClick={handleCreateAccount}
        disabled={loading}
        className="w-full h-10 sm:h-12 text-sm sm:text-base bg-primary text-primary-foreground font-semibold rounded-xl hover:brightness-110 transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Create account'}
      </Button>
    </div>
  )
}