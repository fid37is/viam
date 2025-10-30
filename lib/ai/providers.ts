import { GoogleGenerativeAI } from '@google/generative-ai'

// AI Provider Types
export type AIProvider = 'gemini' | 'openai' | 'anthropic'

// Get current AI provider from environment
export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || 'gemini') as AIProvider
  return provider
}

// Initialize Gemini
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }
  return new GoogleGenerativeAI(apiKey)
}

// Check if API key is configured
export function isAIConfigured(): boolean {
  const provider = getAIProvider()
  
  switch (provider) {
    case 'gemini':
      return !!process.env.GEMINI_API_KEY
    case 'openai':
      return !!process.env.OPENAI_API_KEY
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY
    default:
      return false
  }
}

// Get provider display name
export function getProviderName(provider: AIProvider): string {
  const names = {
    gemini: 'Google Gemini',
    openai: 'OpenAI GPT',
    anthropic: 'Anthropic Claude',
  }
  return names[provider]
}