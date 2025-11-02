'use client'

interface CompanyPreferencesStepProps {
  companySize: string[]
  onCompanySizeChange: (sizes: string[]) => void
  industries: string[]
  onIndustriesChange: (industries: string[]) => void
}

const COMPANY_SIZES = [
  { id: 'startup', label: 'Startup', description: '1-50 employees' },
  { id: 'scale-up', label: 'Scale-up', description: '51-500 employees' },
  { id: 'mid-size', label: 'Mid-size', description: '501-5000 employees' },
  { id: 'enterprise', label: 'Enterprise', description: '5000+ employees' },
]

const INDUSTRIES = [
  { id: 'technology', label: 'Technology' },
  { id: 'finance', label: 'Finance' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'retail', label: 'Retail' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'consulting', label: 'Consulting' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'nonprofit', label: 'Non-Profit' },
]

export default function CompanyPreferencesStep({
  companySize,
  onCompanySizeChange,
  industries,
  onIndustriesChange,
}: CompanyPreferencesStepProps) {
  const toggleCompanySize = (id: string) => {
    if (companySize.includes(id)) {
      onCompanySizeChange(companySize.filter(item => item !== id))
    } else {
      onCompanySizeChange([...companySize, id])
    }
  }

  const toggleIndustry = (id: string) => {
    if (industries.includes(id)) {
      onIndustriesChange(industries.filter(item => item !== id))
    } else {
      onIndustriesChange([...industries, id])
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          Company preferences
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
          Help us find the right fit for you (optional)
        </p>
      </div>

      {/* Company Size */}
      <div>
        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">
          Company Size
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
          {COMPANY_SIZES.map((size) => {
            const isSelected = companySize.includes(size.id)

            return (
              <button
                key={size.id}
                onClick={() => toggleCompanySize(size.id)}
                className={`
                  p-2 sm:p-2.5 md:p-4 rounded-lg sm:rounded-lg md:rounded-xl border-2 text-center transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
                style={isSelected ? { borderColor: 'hsl(var(--primary))' } : {}}
              >
                <div className="text-xs sm:text-xs md:text-sm font-semibold text-foreground mb-0.5 sm:mb-1 break-words">
                  {size.label}
                </div>
                <div className="text-xs md:text-xs text-muted-foreground break-words">
                  {size.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Industries */}
      <div>
        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">
          Industries of Interest
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3">
          {INDUSTRIES.map((industry) => {
            const isSelected = industries.includes(industry.id)

            return (
              <button
                key={industry.id}
                onClick={() => toggleIndustry(industry.id)}
                className={`
                  p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-lg md:rounded-xl border-2 text-center transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
                style={isSelected ? { borderColor: 'hsl(var(--primary))' } : {}}
              >
                <div className="text-xs sm:text-xs md:text-sm font-semibold text-foreground break-words">
                  {industry.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}