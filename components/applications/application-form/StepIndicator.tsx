// components/AddApplicationForm/StepIndicator.tsx
import React from 'react'

interface StepIndicatorProps {
  currentStep: 'url' | 'details' | 'analysis' | 'research' | 'save'
  isLoading?: boolean
}

const STEPS = [
  { id: 'url', label: 'Enter URL' },
  { id: 'details', label: 'Details' },
  { id: 'analysis', label: 'Analyze' },
  { id: 'research', label: 'Research' },
  { id: 'save', label: 'Save' },
]

export default function StepIndicator({ currentStep, isLoading }: StepIndicatorProps) {
  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep)

  return (
    <div className="w-full mb-6 sm:mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all ${
                  index <= currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-2 text-center">
                {step.label}
              </p>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div
                className={`h-1 flex-1 mx-1 sm:mx-2 transition-all ${
                  index < currentStepIndex
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}