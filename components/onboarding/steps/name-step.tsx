'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NameStepProps {
  userName: string
  onUserNameChange: (name: string) => void
}

export default function NameStep({ userName, onUserNameChange }: NameStepProps) {
  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3">
          What can we call you?
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
          We'll personalize your experience with this name
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <Label htmlFor="name" className="text-xs sm:text-sm md:text-base text-foreground font-semibold">
          Your Name
        </Label>
        <Input
          id="name"
          type="text"
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          placeholder="e.g., Sarah Johnson"
          className="h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl border-2 border-input focus:border-primary focus:ring-0 px-3 sm:px-4 placeholder:text-muted-foreground"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && userName.trim().length > 0 && e.currentTarget.form?.requestSubmit()}
        />
        <p className="text-xs sm:text-xs text-white font-medium">
          {userName.trim().length === 0 ? 'Please enter your name to continue' : '✓ Ready to continue'}
        </p>
      </div>

      <div className="p-3 sm:p-4 md:p-5 bg-primary/5 rounded-lg sm:rounded-xl border border-primary/20">
        <p className="text-xs sm:text-xs md:text-sm text-foreground">
          💡 <span className="font-semibold">Tip:</span> We'll use this to personalize job recommendations and your profile throughout Owtras.
        </p>
      </div>
    </div>
  )
}