'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

import GoogleAuthButton from './components/google-auth-button'
import EmailStep from './steps/email-step'
import PasswordStep from './steps/password-step'
import CreatePasswordStep from './steps/create-password-step'
import VerifyStep from './steps/verify-step'
import ForgotPasswordStep from './steps/forgot-password-step'
import ForgotPasswordSentStep from './steps/forgot-password-sent-step'
import ResetPasswordStep from './steps/reset-password-step'

type AuthStep = 'initial' | 'email' | 'verify' | 'password' | 'create-password' | 'forgot-password' | 'forgot-password-sent' | 'reset-password'

export default function AuthSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState<AuthStep>('initial')
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [intentUpgrade, setIntentUpgrade] = useState(false)

  // Check for subscription intent and errors
  useEffect(() => {
    const upgrade = searchParams.get('upgrade')
    const error = searchParams.get('error')
    const type = searchParams.get('type')

    if (upgrade === 'true') setIntentUpgrade(true)
    if (type === 'recovery') setStep('reset-password')

    if (error) {
      const errorMessages: Record<string, string> = {
        'auth_failed': 'Authentication failed. Please try again.',
        'verification_failed': 'Email verification failed. Please try again.',
        'no_token': 'Invalid verification link.',
      }
      toast.error(errorMessages[error] || 'An error occurred')
    }
  }, [searchParams])

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && step !== 'reset-password') {
        if (intentUpgrade) {
          router.push('/subscription')
        } else {
          router.push('/dashboard')
        }
      }
    }
    checkUser()
  }, [intentUpgrade])

  const goBack = () => {
    setStep('initial')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const getHeaderText = () => {
    const headers: Record<AuthStep, { title: string; subtitle: string }> = {
      initial: { title: intentUpgrade ? 'Upgrade to Premium' : 'You got this', subtitle: intentUpgrade ? 'Sign in or create account' : 'Keep track of it' },
      email: { title: 'You got this', subtitle: 'Keep track of it' },
      verify: { title: 'Never give up', subtitle: 'Check your email' },
      password: { title: 'Loving it right?', subtitle: 'Welcome back' },
      'create-password': { title: 'Join the Owtras', subtitle: 'Create your account' },
      'forgot-password': { title: 'Did you forget?', subtitle: 'Reset your password' },
      'forgot-password-sent': { title: 'Almost Done', subtitle: 'Check your email' },
      'reset-password': { title: 'Did you forget?', subtitle: 'Set new password' },
    }
    return headers[step]
  }

  const headerText = getHeaderText()

  return (
    <div className="bg-card rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-auto border border-border">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center relative">
          {step !== 'initial' && step !== 'verify' && step !== 'forgot-password-sent' && (
            <button
              onClick={goBack}
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
        {/* Initial Step - Google + Email Entry */}
        {step === 'initial' && (
          <>
            <GoogleAuthButton 
              loading={googleLoading} 
              onLoading={setGoogleLoading}
              intentUpgrade={intentUpgrade}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 sm:px-3 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            <EmailStep
              email={email}
              onEmailChange={setEmail}
              loading={emailLoading}
              onLoading={setEmailLoading}
              onNewUser={() => setStep('create-password')}
              onExistingUser={() => setStep('password')}
            />
          </>
        )}

        {/* Email Step (from non-initial entry) */}
        {step === 'email' && (
          <EmailStep
            email={email}
            onEmailChange={setEmail}
            loading={emailLoading}
            onLoading={setEmailLoading}
            onNewUser={() => setStep('create-password')}
            onExistingUser={() => setStep('password')}
          />
        )}

        {/* Create Password Step */}
        {step === 'create-password' && (
          <CreatePasswordStep
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            loading={emailLoading}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onShowPasswordChange={setShowPassword}
            onShowConfirmPasswordChange={setShowConfirmPassword}
            onSuccess={() => setStep('verify')}
            onLoading={setEmailLoading}
            intentUpgrade={intentUpgrade}
          />
        )}

        {/* Password Step */}
        {step === 'password' && (
          <PasswordStep
            email={email}
            password={password}
            showPassword={showPassword}
            loading={emailLoading}
            onPasswordChange={setPassword}
            onShowPasswordChange={setShowPassword}
            onSuccess={() => {
              toast.success('Welcome back!')
              router.push(intentUpgrade ? '/subscription' : '/dashboard')
              router.refresh()
            }}
            onForgotPassword={() => setStep('forgot-password')}
            onLoading={setEmailLoading}
          />
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <VerifyStep
            email={email}
            intentUpgrade={intentUpgrade}
            onChangeEmail={() => {
              setStep('initial')
              setEmail('')
            }}
          />
        )}

        {/* Forgot Password Step */}
        {step === 'forgot-password' && (
          <ForgotPasswordStep
            email={email}
            onEmailChange={setEmail}
            loading={emailLoading}
            onLoading={setEmailLoading}
            onSuccess={() => setStep('forgot-password-sent')}
          />
        )}

        {/* Forgot Password Sent Step */}
        {step === 'forgot-password-sent' && (
          <ForgotPasswordSentStep
            email={email}
            onRetry={() => {
              setStep('forgot-password')
              setEmail('')
            }}
          />
        )}

        {/* Reset Password Step */}
        {step === 'reset-password' && (
          <ResetPasswordStep
            password={password}
            confirmPassword={confirmPassword}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            loading={emailLoading}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onShowPasswordChange={setShowPassword}
            onShowConfirmPasswordChange={setShowConfirmPassword}
            onSuccess={() => {
              toast.success('Password reset successfully!')
              router.push('/dashboard')
              router.refresh()
            }}
            onLoading={setEmailLoading}
          />
        )}
      </div>

      {(step === 'initial' || step === 'email' || step === 'create-password' || step === 'password' || step === 'forgot-password') && (
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-4 sm:mt-6 px-2">
          By continuing, you agree to our{' '}
          <a href="#" className="text-secondary hover:underline font-medium">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-secondary hover:underline font-medium">Privacy Policy</a>
        </p>
      )}
    </div>
  )
}