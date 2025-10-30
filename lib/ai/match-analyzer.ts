import { getAIProvider, getGeminiClient } from './providers'

export interface MatchAnalysisResult {
  match_score: number
  category_scores: {
    values_alignment: number
    culture_fit: number
    growth_opportunity: number
    practical_fit: number
  }
  strengths: string[]
  concerns: string[]
  interview_question: string
  summary: string
}

export async function analyzeJobMatch(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  location: string | null,
  userPreferences: {
    top_values: string[]
    deal_breakers: string[]
    work_location_preference: string | null
    preferred_company_size: string[] | null
    preferred_industries: string[] | null
  }
): Promise<MatchAnalysisResult> {
  const provider = getAIProvider()

  switch (provider) {
    case 'gemini':
      return analyzeWithGemini(jobTitle, companyName, jobDescription, location, userPreferences)
    case 'openai':
      throw new Error('OpenAI provider not yet implemented. Set AI_PROVIDER=gemini in .env.local')
    case 'anthropic':
      throw new Error('Anthropic provider not yet implemented. Set AI_PROVIDER=gemini in .env.local')
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

async function analyzeWithGemini(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  location: string | null,
  userPreferences: {
    top_values: string[]
    deal_breakers: string[]
    work_location_preference: string | null
    preferred_company_size: string[] | null
    preferred_industries: string[] | null
  }
): Promise<MatchAnalysisResult> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-lite', // Free tier model, very capable
  })

  const prompt = `You are an expert career advisor analyzing job opportunities. Analyze this job posting against the candidate's preferences and provide a detailed match assessment.

JOB DETAILS:
- Title: ${jobTitle}
- Company: ${companyName}
- Location: ${location || 'Not specified'}
- Description: ${jobDescription.substring(0, 3000)}${jobDescription.length > 3000 ? '...' : ''}

CANDIDATE PREFERENCES:
- Top Values: ${userPreferences.top_values.join(', ') || 'Not specified'}
- Deal Breakers: ${userPreferences.deal_breakers.join(', ') || 'None specified'}
- Work Location Preference: ${userPreferences.work_location_preference || 'Flexible'}
- Preferred Company Sizes: ${userPreferences.preferred_company_size?.join(', ') || 'Any'}
- Preferred Industries: ${userPreferences.preferred_industries?.join(', ') || 'Any'}

IMPORTANT: Respond ONLY with valid JSON in exactly this format (no markdown, no code blocks, just raw JSON):
{
  "match_score": <overall score 0-100 as a number>,
  "category_scores": {
    "values_alignment": <score 0-100>,
    "culture_fit": <score 0-100>,
    "growth_opportunity": <score 0-100>,
    "practical_fit": <score 0-100>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "interview_question": "<one specific question>",
  "summary": "<2-3 sentence overall assessment>"
}

Be honest and balanced in your assessment. Consider:
- How well the role aligns with stated values
- Cultural indicators from the job description
- Growth and learning opportunities mentioned
- Work arrangement alignment
- Red flags or concerns based on deal-breakers

Provide substantive analysis based on the job description content.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Clean up the response (remove markdown code blocks if present)
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '')
    }

    // Parse JSON
    const analysis = JSON.parse(cleanedText) as MatchAnalysisResult

    // Validate and sanitize scores
    analysis.match_score = Math.min(100, Math.max(0, Math.round(analysis.match_score)))
    analysis.category_scores.values_alignment = Math.min(100, Math.max(0, Math.round(analysis.category_scores.values_alignment)))
    analysis.category_scores.culture_fit = Math.min(100, Math.max(0, Math.round(analysis.category_scores.culture_fit)))
    analysis.category_scores.growth_opportunity = Math.min(100, Math.max(0, Math.round(analysis.category_scores.growth_opportunity)))
    analysis.category_scores.practical_fit = Math.min(100, Math.max(0, Math.round(analysis.category_scores.practical_fit)))

    // Ensure arrays exist
    if (!Array.isArray(analysis.strengths)) analysis.strengths = []
    if (!Array.isArray(analysis.concerns)) analysis.concerns = []

    return analysis
  } catch (error: any) {
    console.error('Gemini API error:', error)
    
    if (error.message?.includes('API key')) {
      throw new Error('Gemini API key is invalid or not configured. Please check your GEMINI_API_KEY in .env.local')
    }
    
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response. Please try again.')
    }
    
    throw new Error(`Failed to analyze job match: ${error.message}`)
  }
}