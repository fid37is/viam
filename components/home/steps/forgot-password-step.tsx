// ============================================================
// FILE: app/components/auth/steps/forgot-password-step.tsx
// ============================================================

'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ForgotPasswordStepProps {
  email: string
  onEmailChange: (email: string) => void
  loading: boolean
  onLoading: (state: boolean) => void
  onSuccess: () => void
}

export default function ForgotPasswordStep({
  email,
  onEmailChange,
  loading,
  onLoading,
  onSuccess,
}: ForgotPasswordStepProps) {
  const supabase = createClient()

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    onLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })

      if (error) throw error

      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <Label htmlFor="forgot-email" className="text-sm sm:text-base text-foreground font-medium">
          Email
        </Label>
        <Input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl"
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
          autoFocus
        />
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
          We'll send you a link to reset your password
        </p>
      </div>

      <Button
        onClick={handleForgotPassword}
        disabled={loading}
        className="w-full h-10 sm:h-12 text-sm sm:text-base bg-primary text-primary-foreground font-semibold rounded-xl hover:brightness-110 transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Send reset link'}
      </Button>
    </div>
  )
}