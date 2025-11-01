// app/api/generate-insights/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGeminiClient } from '@/lib/ai/providers'

// Function to clean up and format AI-generated text
function cleanAIText(text: string): string {
  return text
    // Remove excessive asterisks used for bold
    .replace(/\*\*\*+/g, '') // Remove triple or more asterisks
    .replace(/\*\*/g, '') // Remove double asterisks (bold markdown)
    .replace(/\*/g, '') // Remove single asterisks
    
    // Clean up excessive formatting
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/`{1,3}/g, '') // Remove code backticks
    
    // Convert section headers to proper format with hierarchy
    .replace(/^(\d+\.\s+)([A-Z][^:\n]+)(:)?/gm, '\n\n━━━ $2 ━━━\n') // Main sections
    
    // Fix spacing issues
    .replace(/\n{4,}/g, '\n\n\n') // Max 3 consecutive newlines for section breaks
    .replace(/^\s+|\s+$/gm, '') // Trim whitespace from each line
    
    // Clean up bullet points - keep simple format
    .replace(/^[•◦▪▫]\s*/gm, '  • ') // Normalize bullet points with indent
    .replace(/^[-–—]\s*/gm, '  • ') // Convert dashes to bullets with indent
    
    // Add spacing after bullet points for better readability
    .replace(/(  • [^\n]+)\n(?=  •)/g, '$1\n\n') // Space between bullets
    
    // Remove excessive exclamation marks
    .replace(/!{2,}/g, '!') // Max one exclamation mark
    
    // Clean up numbered lists
    .replace(/^\d+\.\s+\*\*/gm, (match) => match.replace('**', ''))
    
    // Add extra spacing before section dividers
    .replace(/\n(━━━)/g, '\n\n$1')
    
    .trim()
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      totalApplications,
      appliedCount,
      interviewingCount,
      offersCount,
      rejectedCount,
      notAppliedCount,
      responseRate,
      averageMatchScore,
      recentApps,
      previousApps,
      topLocations,
    } = await request.json()

    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-lite',
    })

    const prompt = `You are an expert career advisor and job search strategist. Analyze the following job search statistics and provide personalized, actionable insights and recommendations.

JOB SEARCH STATISTICS:
- Total Applications Tracked: ${totalApplications}
- Not Yet Applied: ${notAppliedCount}
- Applied: ${appliedCount}
- Currently Interviewing: ${interviewingCount}
- Offers Received: ${offersCount}
- Rejected: ${rejectedCount}
- Response Rate: ${responseRate}% (interviews + offers / applied)
- Average Match Score: ${averageMatchScore}%
- Recent Activity: ${recentApps} applications in last 7 days (vs ${previousApps} in previous 7 days)
${topLocations.length > 0 ? `- Top Target Locations: ${topLocations.map((l: any) => `${l.location} (${l.count})`).join(', ')}` : ''}

TASK:
Provide a comprehensive career coaching analysis with:

1. Overall Assessment (2-3 sentences)
   - Evaluate their job search performance and momentum
   - Highlight what they're doing well

2. Key Insights (3-4 bullet points)
   - Identify patterns, strengths, and areas of concern
   - Compare their metrics to industry benchmarks
   - Point out any red flags or opportunities

3. Actionable Recommendations (5-7 specific action items)
   - Prioritize by impact (most important first)
   - Make each recommendation specific and actionable
   - Include both quick wins and strategic improvements
   - Address application volume, quality, follow-ups, interview prep, etc.

4. Motivational Closing (1-2 sentences)
   - Encourage and energize them for their job search

FORMAT INSTRUCTIONS:
- Write in plain text without markdown formatting
- Do NOT use asterisks, stars, or special characters for emphasis
- Use simple bullet points with "•" only
- Keep section headers simple without special formatting
- Write naturally as if speaking to them directly
- Be warm, encouraging, but direct
- Use specific numbers from their data

IMPORTANT: 
- If they have very few applications (< 5), emphasize the need to increase volume
- If response rate is low (< 10%), focus on application quality and targeting
- If they have many tracked but not applied, encourage action
- If they're doing well, acknowledge it and suggest optimization strategies`

    const result = await model.generateContent(prompt)
    const rawInsights = result.response.text()
    
    // Clean up the generated text
    const insights = cleanAIText(rawInsights)

    return NextResponse.json({
      success: true,
      insights,
    })

  } catch (error: any) {
    console.error('Insights generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    )
  }
}