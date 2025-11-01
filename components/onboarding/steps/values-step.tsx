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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          What matters most to you?
        </h2>
        <p className="text-xs sm:text-base text-gray-600">
          Select at least 3 values that are important in your next role
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          {selectedValues.length} of 5 selected
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {VALUES.map((value) => {
          const isSelected = selectedValues.includes(value.id)
          const isDisabled = !isSelected && selectedValues.length >= 5

          return (
            <button
              key={value.id}
              onClick={() => toggleValue(value.id)}
              disabled={isDisabled}
              className={`
                p-3 sm:p-5 rounded-lg sm:rounded-2xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              style={isSelected ? { borderColor: '#00e0ff' } : {}}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-base text-gray-900 mb-0.5 sm:mb-1 break-words">{value.label}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">{value.description}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ml-2 flex-shrink-0"
                       style={{ backgroundColor: '#00e0ff' }}>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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