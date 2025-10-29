'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-accent/10 to-primary/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {success ? 'Check your email' : 'Forgot password?'}
            </h1>
            <p className="text-gray-600">
              {success 
                ? 'We sent you a password reset link'
                : "No worries, we'll send you reset instructions"
              }
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <p className="text-gray-700 mb-2">
                  We sent a password reset link to:
                </p>
                <p className="font-semibold text-gray-900">{email}</p>
                <p className="text-sm text-gray-600 mt-4">
                  Click the link in your email to reset your password. 
                  The link will expire in 1 hour.
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/" className="block">
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-semibold">
                    Back to sign in
                  </Button>
                </Link>
                
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-900"
                >
                  Didn't receive the email? Try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 mt-2"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </Button>

              <Link href="/" className="block">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </form>
          )}
        </div>

        {/* Additional help text */}
        {!success && (
          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{' '}
            <Link href="/" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}