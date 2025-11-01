// ============================================================
// WORK PREFERENCES STEP - app/components/onboarding/steps/work-preferences-step.tsx
// ============================================================

interface WorkPreferencesStepProps {
  workLocation: string
  onWorkLocationChange: (location: string) => void
}

const WORK_LOCATIONS = [
  { id: 'remote', label: 'Fully Remote', description: 'Work from anywhere' },
  { id: 'hybrid', label: 'Hybrid', description: 'Mix of office and remote' },
  { id: 'office', label: 'In Office', description: 'On-site work' },
  { id: 'flexible', label: 'Flexible', description: 'Open to any arrangement' },
]

export default function WorkPreferencesStep({ workLocation, onWorkLocationChange }: WorkPreferencesStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          Where do you prefer to work?
        </h2>
        <p className="text-xs sm:text-base text-gray-600">
          Choose your ideal work arrangement
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {WORK_LOCATIONS.map((location) => {
          const isSelected = workLocation === location.id

          return (
            <button
              key={location.id}
              onClick={() => onWorkLocationChange(location.id)}
              className={`
                p-3 sm:p-6 rounded-lg sm:rounded-2xl border-2 text-center transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              style={isSelected ? { borderColor: '#00e0ff' } : {}}
            >
              <h3 className="font-semibold text-xs sm:text-lg text-gray-900 mb-1 sm:mb-2 break-words">{location.label}</h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words">{location.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}