'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

function ReactivateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const email = searchParams.get('email')
  const status = searchParams.get('status')

  const handleReactivate = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email!, {
        redirectTo: `${window.location.origin}/auth/callback?type=reactivate`,
      })

      if (error) throw error

      toast.success('Verification email sent! Check your inbox to confirm reactivation.')
      
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reactivation email')
      setLoading(false)
    }
  }

  if (!email || !status) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full border border-border text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">Invalid reactivation request.</p>
          <Button
            onClick={() => router.push('/')}
            className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl"
          >
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full border border-border text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
          {status === 'hibernated' ? 'Account Hibernated' : 'Account Deleted'}
        </h1>
        
        <p className="text-xs sm:text-sm text-muted-foreground mb-6">
          {status === 'hibernated' 
            ? 'Your account is currently hibernated. Would you like to reactivate it?'
            : 'Your account is scheduled for deletion. You can still reactivate it within the grace period.'}
        </p>

        <p className="text-xs sm:text-sm text-muted-foreground mb-8">
          Email: <span className="font-semibold text-foreground break-all">{email}</span>
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleReactivate}
            disabled={loading}
            className="w-full h-10 sm:h-12 bg-primary text-primary-foreground font-semibold rounded-lg sm:rounded-xl text-xs sm:text-base"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              'Reactivate Account'
            )}
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full border border-border" />
    </div>
  )
}

export default function ReactivatePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReactivateContent />
    </Suspense>
  )
}