'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

type AuthStep = 'email' | 'password' | 'verify' | 'forgot-password' | 'forgot-password-sent' | 'reset-password'

export default function AuthSection() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Check if user came from password reset email link
  useEffect(() => {
    const checkResetToken = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const type = hashParams.get('type')
      
      if (type === 'recovery') {
        setStep('reset-password')
      }
    }
    
    checkResetToken()
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in with Google', {
        style: { color: '#dc2626' }
      })
      setLoading(false)
    }
  }

  const handleEmailContinue = async () => {
    if (!email) {
      toast.error('Please enter your email', {
        style: { color: '#dc2626' }
      })
      return
    }

    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: '___impossible_password_123___',
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials') || 
            signInError.message.includes('Email not confirmed')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password: Math.random().toString(36).slice(-12),
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (signUpError) {
            if (signUpError.message.includes('User already registered') ||
                signUpError.message.includes('already registered')) {
              setStep('password')
            } else {
              throw signUpError
            }
          } else {
            setStep('verify')
          }
        } else {
          throw signInError
        }
      } else {
        setStep('password')
      }
    } catch (err: any) {
      toast.error(err.message, {
        style: { color: '#dc2626' }
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (!password) {
      toast.error('Please enter your password', {
        style: { color: '#dc2626' }
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid password', {
            style: { color: '#dc2626' }
          })
          setLoading(false)
          return
        }
        throw error
      }

      toast.success('Welcome back!', {
        style: { color: '#16a34a' }
      })
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message, {
        style: { color: '#dc2626' }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async () => {
    if (!email) {
      toast.error('Please enter your email', {
        style: { color: '#dc2626' }
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      })

      if (error) throw error

      setStep('forgot-password-sent')
    } catch (err: any) {
      toast.error(err.message, {
        style: { color: '#dc2626' }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPasswordSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields', {
        style: { color: '#dc2626' }
      })
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        style: { color: '#dc2626' }
      })
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters', {
        style: { color: '#dc2626' }
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast.success('Password reset successfully!', {
        style: { color: '#16a34a' }
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message, {
        style: { color: '#dc2626' }
      })
    } finally {
      setLoading(false)
    }
  }

  const goBackToEmail = () => {
    setStep('email')
    setPassword('')
  }

  const goBackToPassword = () => {
    setStep('password')
    setPassword('')
  }

  const openForgotPassword = () => {
    setStep('forgot-password')
  }

  const getHeaderText = () => {
    switch (step) {
      case 'verify':
        return { title: 'TraceAm', subtitle: 'Check your email' }
      case 'password':
        return { title: 'TraceAm', subtitle: 'Welcome back' }
      case 'forgot-password':
        return { title: 'TraceAm', subtitle: 'Reset your password' }
      case 'forgot-password-sent':
        return { title: 'TraceAm', subtitle: 'Check your email' }
      case 'reset-password':
        return { title: 'TraceAm', subtitle: 'Set new password' }
      default:
        return { title: 'TraceAm', subtitle: 'Find your way' }
    }
  }

  const headerText = getHeaderText()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700 relative transition-colors">
      {/* Header with back button */}
      <div className="mb-8">
        <div className="flex items-center justify-center relative">
          {(step === 'password' || step === 'forgot-password') && (
            <button
              onClick={step === 'password' ? goBackToEmail : goBackToPassword}
              className="absolute left-0 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{headerText.title}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-center mt-2">{headerText.subtitle}</p>
      </div>

      <div className="space-y-4">
        {/* Email Verification Step */}
        {step === 'verify' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                 style={{ backgroundColor: '#00e0ff20' }}>
              <span className="text-3xl">📧</span>
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300">We sent a verification link to</p>
              <p className="font-semibold text-gray-900 dark:text-white mt-1">{email}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the link in your email to complete your registration
            </p>
          </div>
        )}

        {/* Forgot Password Sent Step */}
        {step === 'forgot-password-sent' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                 style={{ backgroundColor: '#00e0ff20' }}>
              <span className="text-3xl">📧</span>
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300">We sent a password reset link to</p>
              <p className="font-semibold text-gray-900 dark:text-white mt-1">{email}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the link in your email to reset your password
            </p>
            <button
              onClick={() => {
                setStep('forgot-password')
                setEmail('')
              }}
              className="text-sm hover:underline font-medium mt-4"
              style={{ color: '#00e0ff' }}
            >
              Didn't receive the email? Try again
            </button>
          </div>
        )}

        {/* Reset Password Step */}
        {step === 'reset-password' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password" className="text-gray-700 dark:text-gray-300 font-medium">New password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 mt-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-transparent focus:ring-2 rounded-xl pr-12"
                  style={{ '--tw-ring-color': '#00e0ff' } as any}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const confirmInput = document.getElementById('confirm-password') as HTMLInputElement
                      if (confirmInput) confirmInput.focus()
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300 font-medium">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 mt-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-transparent focus:ring-2 rounded-xl pr-12"
                  style={{ '--tw-ring-color': '#00e0ff' } as any}
                  disabled={loading}
                  onKeyDown={(e) => e.key === 'Enter' && handleResetPasswordSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handleResetPasswordSubmit}
              disabled={loading}
              className="w-full h-12 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#00e0ff' }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset password'}
            </Button>
          </div>
        )}

        {/* Main Auth Flow */}
        {(step === 'email' || step === 'password' || step === 'forgot-password') && (
          <>
            <Button
              variant="outline"
              className="w-full h-12 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all rounded-xl"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
              </div>
            </div>

            {/* Email Step */}
            {step === 'email' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 mt-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-transparent focus:ring-2 rounded-xl"
                    style={{ '--tw-ring-color': '#00e0ff' } as any}
                    disabled={loading}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
                  />
                </div>

                <Button
                  onClick={handleEmailContinue}
                  disabled={loading}
                  className="w-full h-12 text-white font-semibold rounded-xl bg-primary hover:opacity-90 transition-opacity"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                </Button>
              </div>
            )}

            {/* Password Step */}
            {step === 'password' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 mt-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-transparent focus:ring-2 rounded-xl pr-12"
                      style={{ '--tw-ring-color': '#00e0ff' } as any}
                      disabled={loading}
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <button
                      onClick={openForgotPassword}
                      className="text-sm hover:underline font-medium"
                      style={{ color: '#00e0ff' }}
                      type="button"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordSubmit}
                  disabled={loading}
                  className="w-full h-12 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#00e0ff' }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
                </Button>
              </div>
            )}

            {/* Forgot Password Step */}
            {step === 'forgot-password' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email" className="text-gray-700 dark:text-gray-300 font-medium">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 mt-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-transparent focus:ring-2 rounded-xl"
                    style={{ '--tw-ring-color': '#00e0ff' } as any}
                    disabled={loading}
                    onKeyDown={(e) => e.key === 'Enter' && handleForgotPasswordSubmit()}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    We'll send you a link to reset your password
                  </p>
                </div>

                <Button
                  onClick={handleForgotPasswordSubmit}
                  disabled={loading}
                  className="w-full h-12 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#00e0ff' }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {(step === 'email' || step === 'password' || step === 'forgot-password') && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="hover:underline font-medium" style={{ color: '#00e0ff' }}>
            Terms
          </a>
          {' '}and{' '}
          <a href="#" className="hover:underline font-medium" style={{ color: '#00e0ff' }}>
            Privacy Policy
          </a>
        </p>
      )}
    </div>
  )
}