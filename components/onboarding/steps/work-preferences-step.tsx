'use client'

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
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          Where do you prefer to work?
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
          Choose your ideal work arrangement
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {WORK_LOCATIONS.map((location) => {
          const isSelected = workLocation === location.id

          return (
            <button
              key={location.id}
              onClick={() => onWorkLocationChange(location.id)}
              className={`
                p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl border-2 text-center transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }
              `}
              style={isSelected ? { borderColor: 'hsl(var(--primary))' } : {}}
            >
              <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-1 sm:mb-1.5 break-words">
                {location.label}
              </h3>
              <p className="text-xs sm:text-xs md:text-sm text-muted-foreground break-words">
                {location.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
} 