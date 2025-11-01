// app/api/research-company/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGeminiClient } from '@/lib/ai/providers'

interface CompanyResearch {
  name: string
  website: string | null
  description: string
  industry: string
  company_size: string
  headquarters: string
  founded_year: number | null
  culture_summary: string
  pros: string[]
  cons: string[]
  overall_rating: number
  linkedin_url: string | null
  glassdoor_url: string | null
}

interface DuckDuckGoResult {
  Title: string
  Description: string
  FirstURL: string
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

    const { companyName } = await request.json()

    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 })
    }

    // Check if company already exists and was recently researched
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()

    // If researched within last 30 days, return cached data
    if (existingCompany?.last_researched_at) {
      const lastResearched = new Date(existingCompany.last_researched_at)
      const daysSince = (Date.now() - lastResearched.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSince < 30) {
        return NextResponse.json({
          success: true,
          company: existingCompany,
          fromCache: true
        })
      }
    }

    // Perform research with real web search results
    const research = await researchCompany(companyName)

    // Upsert company data
    const { data: company, error: upsertError } = await supabase
      .from('companies')
      .upsert({
        name: research.name,
        slug,
        website: research.website,
        description: research.description,
        industry: research.industry,
        company_size: research.company_size,
        headquarters: research.headquarters,
        founded_year: research.founded_year,
        culture_summary: research.culture_summary,
        pros: research.pros,
        cons: research.cons,
        overall_rating: research.overall_rating,
        linkedin_url: research.linkedin_url,
        glassdoor_url: research.glassdoor_url,
        last_researched_at: new Date().toISOString(),
      }, {
        onConflict: 'slug'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Failed to save company:', upsertError)
      return NextResponse.json({ error: 'Failed to save company data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      company,
      fromCache: false
    })

  } catch (error: any) {
    console.error('Company research error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to research company' },
      { status: 500 }
    )
  }
}

// Search company using DuckDuckGo Instant Answer API
async function searchDuckDuckGo(query: string): Promise<string> {
  try {
    // DuckDuckGo Instant Answer API - Free, no API key needed
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    const data = await response.json()

    // Build search results from multiple sources
    let results = ''

    // Add abstract if available
    if (data.AbstractText) {
      results += `${data.AbstractText}\n\n`
    }

    // Add related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      results += 'Related Information:\n'
      data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
        if (topic.Text) {
          results += `- ${topic.Text}\n`
        }
      })
    }

    return results || `No specific results found for ${query}`
  } catch (error) {
    console.error('DuckDuckGo search error:', error)
    return `Could not fetch search results for ${query}`
  }
}

// Perform company research using Gemini + DuckDuckGo results
async function researchCompany(companyName: string): Promise<CompanyResearch> {
  try {
    // Search for company information
    console.log(`Searching for company: ${companyName}`)
    
    const generalSearch = await searchDuckDuckGo(`${companyName} company`)
    const glassdoorSearch = await searchDuckDuckGo(`${companyName} glassdoor reviews`)
    const linkedinSearch = await searchDuckDuckGo(`${companyName} linkedin`)
    const cultureSearch = await searchDuckDuckGo(`${companyName} company culture employee reviews`)

    // Combine all search results
    const combinedResults = `
GENERAL COMPANY INFO:
${generalSearch}

GLASSDOOR & EMPLOYEE REVIEWS:
${glassdoorSearch}

LINKEDIN INFORMATION:
${linkedinSearch}

COMPANY CULTURE & REVIEWS:
${cultureSearch}
`

    console.log('Search results compiled, sending to Gemini for analysis...')

    // Use Gemini to analyze and structure the search results
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-lite',
    })

    const prompt = `You are a professional company researcher. Analyze the following web search results about "${companyName}" and extract structured company information.

WEB SEARCH RESULTS:
${combinedResults}

Based on these search results, provide accurate company information. Use ONLY information found in the search results - do not make assumptions.

Respond ONLY with valid JSON in exactly this format (no markdown, no code blocks, no extra text):
{
  "name": "Official Company Name",
  "website": "https://official-company-website.com or null",
  "description": "Accurate 3-4 sentence description based on search results",
  "industry": "Specific industry found in results",
  "company_size": "Startup/Small (1-50)/Medium (51-500)/Large (501-5000)/Enterprise (5000+)",
  "headquarters": "City, State/Country found in results",
  "founded_year": 2020,
  "culture_summary": "2-3 sentence summary of company culture from employee reviews",
  "pros": ["Positive aspect from reviews", "Positive aspect from reviews", "Positive aspect from reviews", "Positive aspect from reviews"],
  "cons": ["Negative aspect from reviews", "Negative aspect from reviews", "Negative aspect from reviews"],
  "overall_rating": 3.8,
  "linkedin_url": "https://www.linkedin.com/company/company-name or null",
  "glassdoor_url": "https://www.glassdoor.com/Overview/Working-at-company-name.htm or null"
}

IMPORTANT:
- Use ONLY information from the search results above
- If information is not found, use null for URLs
- overall_rating should be between 1.0 and 5.0
- founded_year should be null if not found
- pros and cons should be based on actual employee reviews found in results
- Respond ONLY with JSON, nothing else`

    const result = await model.generateContent(prompt)
    const response = result.response
    let text = response.text().trim()

    console.log('Gemini response received, parsing JSON...')

    // Clean up response - remove markdown if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const research = JSON.parse(text) as CompanyResearch

    // Validate and sanitize
    research.overall_rating = Math.min(5.0, Math.max(1.0, research.overall_rating || 3.0))
    if (!Array.isArray(research.pros)) research.pros = []
    if (!Array.isArray(research.cons)) research.cons = []
    
    // Validate URLs - ensure they're not job board URLs (except LinkedIn and Glassdoor)
    if (research.website && research.website !== 'null') {
      const jobBoards = ['linkedin.com', 'indeed.com', 'monster.com', 'ziprecruiter.com']
      const isJobBoard = jobBoards.some(board => research.website?.includes(board))
      if (isJobBoard) {
        research.website = null
      }
    } else {
      research.website = null
    }

    console.log(`Successfully researched company: ${research.name}`)

    return research

  } catch (error: any) {
    console.error('Company research error:', error)
    
    // Return basic structure if research fails
    return {
      name: companyName,
      website: null,
      description: 'Company information could not be automatically researched. Please search for the company manually.',
      industry: 'Unknown',
      company_size: 'Unknown',
      headquarters: 'Unknown',
      founded_year: null,
      culture_summary: 'Information not available',
      pros: [],
      cons: [],
      overall_rating: 3.0,
      linkedin_url: null,
      glassdoor_url: null
    }
  }
}