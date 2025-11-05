// app/api/ai-status/route.ts

import { NextResponse } from 'next/server'

export async function GET() {
  const provider = (process.env.AI_PROVIDER || 'gemini') as 'gemini' | 'openai' | 'anthropic'
  
  let isConfigured = false
  let providerName = 'Unknown'

  switch (provider) {
    case 'gemini':
      isConfigured = !!process.env.GEMINI_API_KEY
      providerName = 'Google Gemini'
      break
    case 'openai':
      isConfigured = !!process.env.OPENAI_API_KEY
      providerName = 'OpenAI GPT'
      break
    case 'anthropic':
      isConfigured = !!process.env.ANTHROPIC_API_KEY
      providerName = 'Anthropic Claude'
      break
  }

  return NextResponse.json({
    provider,
    providerName,
    isConfigured
  })
}