'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import ValuesStep from './steps/values-step'
import DealBreakersStep from './steps/deal-breakers-step'
import WorkPreferencesStep from './steps/work-preferences-step'
import CompanyPreferencesStep from './steps/company-preferences-step'

type OnboardingStep = 'values' | 'deal-breakers' | 'work-preferences' | 'company-preferences'

interface OnboardingFlowProps {
  user: User
}

export default function OnboardingFlow({ user }: OnboardingFlowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectAfter = searchParams.get('redirect')
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('values')
  const [loading, setLoading] = useState(false)

  // Form data
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [selectedDealBreakers, setSelectedDealBreakers] = useState<string[]>([])
  const [workLocation, setWorkLocation] = useState<string>('')
  const [companySize, setCompanySize] = useState<string[]>([])
  const [industries, setIndustries] = useState<string[]>([])

  const steps: OnboardingStep[] = ['values', 'deal-breakers', 'work-preferences', 'company-preferences']
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const canProceed = () => {
    switch (currentStep) {
      case 'values':
        return selectedValues.length >= 3
      case 'deal-breakers':
        return true // Optional
      case 'work-preferences':
        return workLocation !== ''
      case 'company-preferences':
        return true // Optional
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1])
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
    }
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          top_values: selectedValues,
          deal_breakers: selectedDealBreakers,
          work_location_preference: workLocation,
          preferred_company_size: companySize,
          preferred_industries: industries,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile setup complete!', {
        style: { color: '#16a34a' }
      })

      // Redirect based on the redirect parameter
      const destination = redirectAfter || '/dashboard'
      router.push(destination)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message, {
        style: { color: '#dc2626' }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white via-accent/5 to-primary/5">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome to Owtras! 👋</h1>
          <p className="text-xs sm:text-base text-gray-600">Let's personalize your job search experience</p>
          
          {/* Show upgrade notice if redirecting to subscription */}
          {redirectAfter === '/subscription' && (
            <div className="mt-4 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                🎉 After setup, you'll be redirected to upgrade to Premium
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%`, backgroundColor: '#00e0ff' }}
            />
          </div>
        </div>

        {/* Steps Content */}
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-6 border border-gray-100">
          {currentStep === 'values' && (
            <ValuesStep
              selectedValues={selectedValues}
              onValuesChange={setSelectedValues}
            />
          )}

          {currentStep === 'deal-breakers' && (
            <DealBreakersStep
              selectedDealBreakers={selectedDealBreakers}
              onDealBreakersChange={setSelectedDealBreakers}
            />
          )}

          {currentStep === 'work-preferences' && (
            <WorkPreferencesStep
              workLocation={workLocation}
              onWorkLocationChange={setWorkLocation}
            />
          )}

          {currentStep === 'company-preferences' && (
            <CompanyPreferencesStep
              companySize={companySize}
              onCompanySizeChange={setCompanySize}
              industries={industries}
              onIndustriesChange={setIndustries}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-300 text-xs sm:text-base font-medium"
              disabled={loading}
            >
              Back
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="w-full h-10 sm:h-12 text-black font-semibold rounded-lg sm:rounded-xl hover:opacity-90 transition-opacity text-xs sm:text-base"
            style={{ backgroundColor: '#00e0ff' }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : currentStepIndex === steps.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Complete Setup
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>

        {/* Skip option */}
        {currentStep !== 'values' && (
          <div className="text-center mt-3 sm:mt-4">
            <button
              onClick={handleComplete}
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors"
              disabled={loading}
            >
              Skip and complete later
            </button>
          </div>
        )}
      </div>
    </div>
  )
}