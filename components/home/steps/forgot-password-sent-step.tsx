'use client'

interface ForgotPasswordSentStepProps {
  email: string
  onRetry: () => void
}

export default function ForgotPasswordSentStep({
  email,
  onRetry,
}: ForgotPasswordSentStepProps) {
  return (
    <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto bg-muted">
        <span className="text-2xl sm:text-3xl">📧</span>
      </div>
      <div className="px-4">
        <p className="text-sm sm:text-base text-muted-foreground">
          We sent a password reset link to
        </p>
        <p className="font-semibold text-sm sm:text-base text-foreground mt-1 break-all">
          {email}
        </p>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground px-4">
        Click the link in your email to reset your password
      </p>
      <button
        onClick={onRetry}
        className="text-xs sm:text-sm text-primary hover:underline font-medium mt-3 sm:mt-4"
      >
        Didn't receive the email? Try again
      </button>
    </div>
  )
}