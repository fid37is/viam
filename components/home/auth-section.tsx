'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

type AuthStep = 'email' | 'create-password' | 'password' | 'verify' | 'forgot-password' | 'forgot-password-sent' | 'reset-password'

export default function AuthSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [intentUpgrade, setIntentUpgrade] = useState(false)

  // Check for subscription intent and errors in URL
  useEffect(() => {
    const error = searchParams.get('error')
    const type = searchParams.get('type')
    const upgrade = searchParams.get('upgrade')
    
    if (upgrade === 'true') {
      setIntentUpgrade(true)
    }
    
    if (error) {
      const errorMessages: Record<string, string> = {
        'auth_failed': 'Authentication failed. Please try again.',
        'verification_failed': 'Email verification failed. Please try again.',
        'no_token': 'Invalid verification link.',
      }
      toast.error(errorMessages[error] || 'An error occurred')
    }
    
    if (type === 'recovery') {
      setStep('reset-password')
    }
  }, [searchParams])

  // Check if user is already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && step !== 'reset-password') {
        // If user is authenticated and wants to upgrade, redirect to subscription
        if (intentUpgrade) {
          router.push('/subscription')
        } else {
          router.push('/dashboard')
        }
      }
    }
    checkUser()
  }, [intentUpgrade])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    
    try {
      const redirectUrl = intentUpgrade 
        ? `${window.location.origin}/auth/callback?redirect=/subscription`
        : `${window.location.origin}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleEmailContinue = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      // Check if user exists by attempting sign-in with impossible password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: '___impossible_password_check_123___',
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          // User exists - go to password step
          setIsNewUser(false)
          setStep('password')
        } else if (signInError.message.includes('Email not confirmed')) {
          // User exists but hasn't verified email
          toast.error('Please verify your email first. Check your inbox for the verification link.')
        } else {
          // New user - go to create password step
          setIsNewUser(true)
          setStep('create-password')
        }
      } else {
        // Somehow authenticated (shouldn't happen with impossible password)
        setIsNewUser(false)
        setStep('password')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

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

    setLoading(true)

    try {
      // Build redirect URL with subscription intent
      const baseRedirect = `${window.location.origin}/auth/callback`
      const redirectUrl = intentUpgrade 
        ? `${baseRedirect}?redirect=/subscription&new_user=true`
        : `${baseRedirect}?new_user=true`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            intent_upgrade: intentUpgrade
          }
        },
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('This email is already registered. Please sign in instead.')
          setIsNewUser(false)
          setStep('password')
        } else {
          throw error
        }
      } else {
        setStep('verify')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (!password) {
      toast.error('Please enter your password')
      return
    }

    setLoading(true)

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid password')
          setLoading(false)
          return
        }
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email first. Check your inbox for the verification link.')
          setLoading(false)
          return
        }
        throw error
      }

      toast.success('Welcome back!')
      
      // Redirect based on subscription intent
      if (intentUpgrade) {
        router.push('/subscription')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })

      if (error) throw error

      setStep('forgot-password-sent')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPasswordSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast.success('Password reset successfully!')
      
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const goBackToEmail = () => {
    setStep('email')
    setPassword('')
    setConfirmPassword('')
    setIsNewUser(false)
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
        return { title: 'Never give up', subtitle: 'Check your email' }
      case 'create-password':
        return { title: 'Join the Owtras', subtitle: 'Create your account' }
      case 'password':
        return { title: 'Loving it right?', subtitle: 'Welcome back' }
      case 'forgot-password':
        return { title: 'Did you forget?', subtitle: 'Reset your password' }
      case 'forgot-password-sent':
        return { title: 'Almost Done', subtitle: 'Check your email' }
      case 'reset-password':
        return { title: 'Did you forget?', subtitle: 'Set new password' }
      default:
        return { 
          title: intentUpgrade ? 'Upgrade to Premium' : 'You got this', 
          subtitle: intentUpgrade ? 'Sign in or create account to continue' : 'Keep track of it' 
        }
    }
  }

  const headerText = getHeaderText()

  return (
    <div className="bg-card rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-auto border border-border relative transition-colors">
      {/* Header with back button */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center relative">
          {(step === 'password' || step === 'create-password' || step === 'forgot-password') && (
            <button
              onClick={step === 'forgot-password' ? goBackToPassword : goBackToEmail}
              className="absolute left-0 p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{headerText.title}</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground text-center mt-1.5 sm:mt-2">{headerText.subtitle}</p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Email Verification Step */}
        {step === 'verify' && (
          <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto bg-muted">
              <span className="text-2xl sm:text-3xl">📧</span>
            </div>
            <div className="px-4">
              <p className="text-sm sm:text-base text-muted-foreground">We sent a verification link to</p>
              <p className="font-semibold text-sm sm:text-base text-foreground mt-1 break-all">{email}</p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              Click the link in your email to complete your registration{intentUpgrade ? ' and upgrade to Premium' : ''}
            </p>
            {intentUpgrade && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/10 rounded-lg mx-4">
                <p className="text-xs sm:text-sm text-foreground font-medium">
                  After verification, you'll go through a quick onboarding, then be redirected to complete your Premium upgrade.
                </p>
              </div>
            )}
            <button
              onClick={goBackToEmail}
              className="text-xs sm:text-sm text-primary hover:underline font-medium mt-3 sm:mt-4"
            >
              Use a different email
            </button>
          </div>
        )}

        {/* Forgot Password Sent Step */}
        {step === 'forgot-password-sent' && (
          <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto bg-muted">
              <span className="text-2xl sm:text-3xl">📧</span>
            </div>
            <div className="px-4">
              <p className="text-sm sm:text-base text-muted-foreground">We sent a password reset link to</p>
              <p className="font-semibold text-sm sm:text-base text-foreground mt-1 break-all">{email}</p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              Click the link in your email to reset your password
            </p>
            <button
              onClick={() => {
                setStep('forgot-password')
                setEmail('')
              }}
              className="text-xs sm:text-sm text-primary hover:underline font-medium mt-3 sm:mt-4"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        )}

        {/* Reset Password Step */}
        {step === 'reset-password' && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="new-password" className="text-sm sm:text-base text-foreground font-medium">New password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl pr-10 sm:pr-12"
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
              <Label htmlFor="confirm-password" className="text-sm sm:text-base text-foreground font-medium">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl pr-10 sm:pr-12"
                  disabled={loading}
                  onKeyDown={(e) => e.key === 'Enter' && handleResetPasswordSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              onClick={handleResetPasswordSubmit}
              disabled={loading}
              className="w-full h-10 sm:h-12 text-sm sm:text-base bg-primary text-primary-foreground font-semibold rounded-xl hover:brightness-110 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Reset password'}
            </Button>
          </div>
        )}

        {/* Main Auth Flow */}
        {(step === 'email' || step === 'create-password' || step === 'password' || step === 'forgot-password') && (
          <>
            <Button
              variant="outline"
              className="w-full h-10 sm:h-12 text-sm sm:text-base border-input hover:bg-muted bg-background text-foreground transition-all rounded-xl"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="hidden xs:inline">Continue with Google</span>
                  <span className="xs:hidden">Google</span>
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 sm:px-3 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            {/* Email Step */}
            {step === 'email' && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base text-foreground font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl"
                    disabled={loading}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleEmailContinue}
                  disabled={loading}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base bg-primary text-primary-foreground font-semibold rounded-xl hover:brightness-110 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Continue'}
                </Button>
              </div>
            )}

            {/* Create Password Step (New Users) */}
            {step === 'create-password' && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="create-password" className="text-sm sm:text-base text-foreground font-medium">Create password</Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl pr-10 sm:pr-12"
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const confirmInput = document.getElementById('confirm-create-password') as HTMLInputElement
                          if (confirmInput) confirmInput.focus()
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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
                  <Label htmlFor="confirm-create-password" className="text-sm sm:text-base text-foreground font-medium">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-create-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl pr-10 sm:pr-12"
                      disabled={loading}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            )}

            {/* Password Step (Existing Users) */}
            {step === 'password' && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="password" className="text-sm sm:text-base text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl pr-10 sm:pr-12"
                      disabled={loading}
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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
                  <div className="mt-1.5 sm:mt-2 text-right">
                    <button
                      onClick={openForgotPassword}
                      className="text-xs sm:text-sm text-secondary hover:underline font-medium"
                      type="button"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordSubmit}
                  disabled={loading}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base bg-primary text-primary-foreground font-semibold rounded-xl hover:brightness-110 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Sign in'}
                </Button>
              </div>
            )}

            {/* Forgot Password Step */}
            {step === 'forgot-password' && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="forgot-email" className="text-sm sm:text-base text-foreground font-medium">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-10 sm:h-12 mt-1 bg-background border-input text-sm sm:text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-primary rounded-xl"
                    disabled={loading}
                    onKeyDown={(e) => e.key === 'Enter' && handleForgotPasswordSubmit()}
                    autoFocus
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    We'll send you a link to reset your password
                  </p>
                </div>

                <Button
                  onClick={handleForgotPasswordSubmit}
                  disabled={loading}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base bg-primary text-primary-foreground font-semibold rounded-xl hover:brightness-110 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Send reset link'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {(step === 'email' || step === 'create-password' || step === 'password' || step === 'forgot-password') && (
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-4 sm:mt-6 px-2">
          By continuing, you agree to our{' '}
          <a href="#" className="text-secondary hover:underline font-medium">
            Terms
          </a>
          {' '}and{' '}
          <a href="#" className="text-secondary hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      )}
    </div>
  )
}