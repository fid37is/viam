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
    
    // Remove excessive exclamation marks
    .replace(/!{2,}/g, '!') // Max one exclamation mark
    
    // CRITICAL: Ensure section titles are on separate lines
    .replace(/([.!?])([A-Z][a-z]+\s+[A-Z][a-z]+:)/g, '$1\n\n$2\n\n')
    .replace(/([.!?])([A-Z][a-z]+:)/g, '$1\n\n$2\n\n')
    
    // Ensure bullet points are each on their own line
    .replace(/([^\n])(•|[•◦▪▫])/g, '$1\n$2') // Add newline before bullet if missing
    .replace(/^[•◦▪▫–—]\s*/gm, '• ') // Normalize all bullet types to •
    
    // Clean up spacing
    .replace(/\n{4,}/g, '\n\n') // Max 2 consecutive newlines
    .replace(/^\s+|\s+$/gm, '') // Trim whitespace from each line
    
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
Provide a comprehensive career coaching analysis with the following sections. CRITICAL: Each section title MUST be on its own line, followed by bullet points (where applicable), with each bullet point on a new line.

Overall Assessment:

[Write 2-3 sentences here]

Key Insights:

• [First insight]
• [Second insight]
• [Third insight]

Actionable Recommendations:

• [First recommendation]
• [Second recommendation]
• [Third recommendation]
• [Fourth recommendation]
• [Fifth recommendation]

Motivational Closing:

[Write 1-2 sentences here]

CONTENT GUIDELINES:
1. Overall Assessment: Evaluate their job search performance and momentum, highlight what they're doing well
2. Key Insights: Identify 3-4 patterns, strengths, areas of concern. Compare to industry benchmarks
3. Actionable Recommendations: Provide 5-7 specific action items, prioritized by impact
4. Motivational Closing: Encourage and energize them

FORMAT RULES (CRITICAL):
- Write in plain text without markdown formatting
- Do NOT use asterisks, stars, or special characters for emphasis
- Each section title MUST end with a colon and be on its own separate line
- Each bullet point MUST start on a new line with "•" character
- Leave a blank line between sections
- Write naturally and warmly
- Use specific numbers from their data

EXAMPLE FORMAT:
Overall Assessment:

[Your assessment paragraph here]

Key Insights:

• First insight with specific data
• Second insight comparing to benchmarks
• Third insight about patterns

Actionable Recommendations:

• First specific action item
• Second specific action item
• Third specific action item

Motivational Closing:

[Your encouragement here]

IMPORTANT CONTEXT:
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