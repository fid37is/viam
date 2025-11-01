// ============================================================
// DEAL BREAKERS STEP - app/components/onboarding/steps/deal-breakers-step.tsx
// ============================================================

interface DealBreakersStepProps {
  selectedDealBreakers: string[]
  onDealBreakersChange: (dealBreakers: string[]) => void
}

const DEAL_BREAKERS = [
  { id: 'no-remote', label: 'No Remote Options', description: 'Must work in office full-time' },
  { id: 'long-hours', label: 'Long Hours', description: 'Consistent overtime expected' },
  { id: 'poor-dei', label: 'Poor DEI Record', description: 'Lack of diversity and inclusion' },
  { id: 'unclear-mission', label: 'Unclear Mission', description: 'No clear purpose or values' },
  { id: 'low-growth', label: 'Limited Growth', description: 'Few advancement opportunities' },
  { id: 'micromanagement', label: 'Micromanagement', description: 'Overly controlling management' },
  { id: 'poor-reviews', label: 'Poor Employee Reviews', description: 'Consistently negative feedback' },
  { id: 'unstable-funding', label: 'Unstable Funding', description: 'Financial uncertainty' },
  { id: 'toxic-culture', label: 'Toxic Culture', description: 'Unhealthy work environment' },
  { id: 'no-benefits', label: 'Limited Benefits', description: 'Poor health/retirement benefits' },
]

export default function DealBreakersStep({ selectedDealBreakers, onDealBreakersChange }: DealBreakersStepProps) {
  const toggleDealBreaker = (id: string) => {
    if (selectedDealBreakers.includes(id)) {
      onDealBreakersChange(selectedDealBreakers.filter(item => item !== id))
    } else {
      onDealBreakersChange([...selectedDealBreakers, id])
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          Any deal-breakers?
        </h2>
        <p className="text-xs sm:text-base text-gray-600">
          Select things you definitely want to avoid (optional)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {DEAL_BREAKERS.map((dealBreaker) => {
          const isSelected = selectedDealBreakers.includes(dealBreaker.id)

          return (
            <button
              key={dealBreaker.id}
              onClick={() => toggleDealBreaker(dealBreaker.id)}
              className={`
                p-3 sm:p-5 rounded-lg sm:rounded-2xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-secondary bg-secondary/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              style={isSelected ? { borderColor: '#ff304f' } : {}}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-base text-gray-900 mb-0.5 sm:mb-1 break-words">{dealBreaker.label}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">{dealBreaker.description}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ml-2 flex-shrink-0"
                       style={{ backgroundColor: '#ff304f' }}>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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