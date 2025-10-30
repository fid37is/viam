'use client'

import { getAIProvider, getProviderName, isAIConfigured } from '@/lib/ai/providers'
import { CheckCircle, XCircle } from 'lucide-react'

export default function AIStatus() {
  const provider = getAIProvider()
  const isConfigured = isAIConfigured()

  return (
    <div className="flex items-center gap-2 text-sm">
      {isConfigured ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-gray-700">
            AI: {getProviderName(provider)} (Active)
          </span>
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-gray-700">
            AI: Not Configured
          </span>
        </>
      )}
    </div>
  )
}