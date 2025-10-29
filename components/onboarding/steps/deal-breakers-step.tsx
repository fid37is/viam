'use client'

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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Any deal-breakers?
        </h2>
        <p className="text-gray-600">
          Select things you definitely want to avoid (optional)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEAL_BREAKERS.map((dealBreaker) => {
          const isSelected = selectedDealBreakers.includes(dealBreaker.id)

          return (
            <button
              key={dealBreaker.id}
              onClick={() => toggleDealBreaker(dealBreaker.id)}
              className={`
                p-5 rounded-2xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-secondary bg-secondary/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              style={isSelected ? { borderColor: '#ff304f' } : {}}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{dealBreaker.label}</h3>
                  <p className="text-sm text-gray-600">{dealBreaker.description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center ml-3 flex-shrink-0"
                       style={{ backgroundColor: '#ff304f' }}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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