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

    // Perform AI research with web search
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

async function researchCompany(companyName: string): Promise<CompanyResearch> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-lite',
  })

  const prompt = `You are a professional company researcher with web search capabilities. Research "${companyName}" and provide comprehensive, accurate information.

CRITICAL INSTRUCTIONS:
1. Find the company's OFFICIAL website (not job boards like LinkedIn, Indeed, Glassdoor)
2. If the company has a LinkedIn page, include the LinkedIn company page URL
3. If the company has a Glassdoor page, include the Glassdoor company page URL
4. Use real, publicly available information
5. Be honest about what you find

Search the web for:
- Official company website
- Company LinkedIn page
- Company Glassdoor reviews and ratings
- Company information (industry, size, location, culture)
- Employee reviews and feedback
- Company reputation and work environment

Respond ONLY with valid JSON in exactly this format (no markdown, no code blocks):
{
  "name": "Official Company Name",
  "website": "https://official-company-website.com",
  "description": "Comprehensive 3-4 sentence description of what the company does, their products/services, and market position",
  "industry": "Primary industry category",
  "company_size": "Startup/Small (1-50)/Medium (51-500)/Large (501-5000)/Enterprise (5000+)",
  "headquarters": "City, State/Country",
  "founded_year": 2020,
  "culture_summary": "2-3 sentence summary of company culture, work environment, and employee experience based on reviews",
  "pros": ["Specific positive aspect 1", "Specific positive aspect 2", "Specific positive aspect 3", "Specific positive aspect 4"],
  "cons": ["Specific negative aspect 1", "Specific negative aspect 2", "Specific negative aspect 3"],
  "overall_rating": 3.8,
  "linkedin_url": "https://www.linkedin.com/company/company-name",
  "glassdoor_url": "https://www.glassdoor.com/Overview/Working-at-company-name.htm"
}

IMPORTANT:
- website must be the official company website (e.g., company.com, NOT linkedin.com or indeed.com)
- linkedin_url should be the company's LinkedIn page (format: linkedin.com/company/...)
- glassdoor_url should be the company's Glassdoor page if it exists
- overall_rating should be between 1.0 and 5.0
- If information is not available, use null for URLs and reasonable estimates for other fields
- founded_year should be null if unknown`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    let text = response.text().trim()

    // Clean up response
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '')
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '')
    }

    const research = JSON.parse(text) as CompanyResearch

    // Validate and sanitize
    research.overall_rating = Math.min(5.0, Math.max(1.0, research.overall_rating || 3.0))
    if (!Array.isArray(research.pros)) research.pros = []
    if (!Array.isArray(research.cons)) research.cons = []
    
    // Validate URLs - ensure they're not job board URLs
    if (research.website) {
      const jobBoards = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 'ziprecruiter.com']
      const isJobBoard = jobBoards.some(board => research.website?.includes(board))
      if (isJobBoard) {
        research.website = null
      }
    }

    return research

  } catch (error: any) {
    console.error('Gemini research error:', error)
    
    // Return basic structure if AI fails
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