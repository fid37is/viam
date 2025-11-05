'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

export default function AIStatus() {
  const [provider, setProvider] = useState<string>('Gemini')
  const [isConfigured, setIsConfigured] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch AI status from an API endpoint
    const fetchAIStatus = async () => {
      try {
        const response = await fetch('/api/ai-status')
        const data = await response.json()
        
        setProvider(data.providerName || 'Unknown')
        setIsConfigured(data.isConfigured || false)
      } catch (error) {
        console.error('Failed to fetch AI status:', error)
        setIsConfigured(false)
        setProvider('Unknown')
      } finally {
        setLoading(false)
      }
    }

    fetchAIStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />
        <span className="text-gray-700">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isConfigured ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-gray-700">
            AI: {provider} (Active)
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