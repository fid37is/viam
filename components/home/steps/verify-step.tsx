// ============================================================
// FILE: app/components/auth/steps/verify-step.tsx
// ============================================================

'use client'

interface VerifyStepProps {
  email: string
  intentUpgrade: boolean
  onChangeEmail: () => void
}

export default function VerifyStep({
  email,
  intentUpgrade,
  onChangeEmail,
}: VerifyStepProps) {
  return (
    <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto bg-muted">
        <span className="text-2xl sm:text-3xl">📧</span>
      </div>

      <div className="px-4">
        <p className="text-sm sm:text-base text-muted-foreground">
          We sent a verification link to
        </p>
        <p className="font-semibold text-sm sm:text-base text-foreground mt-1 break-all">
          {email}
        </p>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground px-4">
        Click the link in your email to complete your registration
        {intentUpgrade ? ' and upgrade to Premium' : ''}
      </p>

      {intentUpgrade && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/10 rounded-lg mx-4">
          <p className="text-xs sm:text-sm text-foreground font-medium">
            After verification, you'll go through onboarding, then upgrade to Premium.
          </p>
        </div>
      )}

      <button
        onClick={onChangeEmail}
        className="text-xs sm:text-sm text-primary hover:underline font-medium mt-3 sm:mt-4"
      >
        Use a different email
      </button>
    </div>
  )
}