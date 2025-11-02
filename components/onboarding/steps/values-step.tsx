'use client'

interface ValuesStepProps {
  selectedValues: string[]
  onValuesChange: (values: string[]) => void
}

const VALUES = [
  { id: 'mission-driven', label: 'Mission-Driven Work', description: 'Work that makes a difference' },
  { id: 'work-life-balance', label: 'Work-Life Balance', description: 'Time for life outside work' },
  { id: 'high-compensation', label: 'High Compensation', description: 'Competitive salary and benefits' },
  { id: 'career-growth', label: 'Career Growth', description: 'Clear advancement opportunities' },
  { id: 'innovation', label: 'Innovation', description: 'Cutting-edge technology and ideas' },
  { id: 'dei-commitment', label: 'DEI Commitment', description: 'Diversity, equity, and inclusion' },
  { id: 'remote-work', label: 'Remote Work', description: 'Location flexibility' },
  { id: 'team-culture', label: 'Team Culture', description: 'Collaborative and supportive team' },
  { id: 'learning-opportunities', label: 'Learning & Development', description: 'Continuous learning culture' },
  { id: 'impact', label: 'Direct Impact', description: 'See results of your work quickly' },
  { id: 'job-security', label: 'Job Security', description: 'Stable and established company' },
  { id: 'autonomy', label: 'Autonomy', description: 'Freedom to work your way' },
]

export default function ValuesStep({ selectedValues, onValuesChange }: ValuesStepProps) {
  const toggleValue = (valueId: string) => {
    if (selectedValues.includes(valueId)) {
      onValuesChange(selectedValues.filter(id => id !== valueId))
    } else {
      if (selectedValues.length < 5) {
        onValuesChange([...selectedValues, valueId])
      }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          What matters most to you?
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-2 sm:mb-2.5">
          Select at least 3 values that are important in your next role
        </p>
        <p className="text-xs md:text-xs text-muted-foreground font-medium">
          {selectedValues.length} of 5 selected
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {VALUES.map((value) => {
          const isSelected = selectedValues.includes(value.id)
          const isDisabled = !isSelected && selectedValues.length >= 5

          return (
            <button
              key={value.id}
              onClick={() => toggleValue(value.id)}
              disabled={isDisabled}
              className={`
                p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : isDisabled
                  ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }
              `}
              style={isSelected ? { borderColor: 'hsl(var(--primary))' } : {}}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-0.5 sm:mb-1 break-words">
                    {value.label}
                  </h3>
                  <p className="text-xs sm:text-xs md:text-sm text-muted-foreground break-words">
                    {value.description}
                  </p>
                </div>
                {isSelected && (
                  <div 
                    className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ml-2 flex-shrink-0"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                  >
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}