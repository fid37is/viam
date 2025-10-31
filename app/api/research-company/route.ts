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
  culture_summary: string
  pros: string[]
  cons: string[]
  overall_rating: number
  key_facts: string[]
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

    const { companyName, website } = await request.json()

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

    // Perform AI research
    const research = await researchCompany(companyName, website)

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
        culture_summary: research.culture_summary,
        pros: research.pros,
        cons: research.cons,
        overall_rating: research.overall_rating,
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

async function researchCompany(
  companyName: string,
  website: string | null
): Promise<CompanyResearch> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-lite',
  })

  const prompt = `You are a professional company researcher. Research this company and provide comprehensive background information that would help a job seeker evaluate whether to apply.

COMPANY: ${companyName}
${website ? `WEBSITE: ${website}` : ''}

Research and provide detailed information about:
1. What the company does (products/services)
2. Industry and market position
3. Company size and scale
4. Company culture and work environment
5. Employee reviews and reputation
6. Benefits and drawbacks of working there

IMPORTANT: Respond ONLY with valid JSON in exactly this format (no markdown, no code blocks):
{
  "name": "${companyName}",
  "website": "${website || ''}",
  "description": "<comprehensive 3-4 sentence description of what company does>",
  "industry": "<primary industry>",
  "company_size": "<Startup/Small/Medium/Large/Enterprise>",
  "headquarters": "<city, country>",
  "culture_summary": "<2-3 sentence summary of company culture and work environment>",
  "pros": ["<pro 1>", "<pro 2>", "<pro 3>", "<pro 4>"],
  "cons": ["<con 1>", "<con 2>", "<con 3>"],
  "overall_rating": <rating 1.0-5.0 as number>,
  "key_facts": ["<fact 1>", "<fact 2>", "<fact 3>"]
}

Base your research on publicly available information. Be honest and balanced. If you don't have specific information, make reasonable inferences based on the company name and industry, but note uncertainty.`

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
    research.overall_rating = Math.min(5.0, Math.max(1.0, research.overall_rating))
    if (!Array.isArray(research.pros)) research.pros = []
    if (!Array.isArray(research.cons)) research.cons = []
    if (!Array.isArray(research.key_facts)) research.key_facts = []

    return research

  } catch (error: any) {
    console.error('Gemini research error:', error)
    
    // Return basic structure if AI fails
    return {
      name: companyName,
      website: website,
      description: 'Company information could not be automatically researched. Please add details manually.',
      industry: 'Unknown',
      company_size: 'Unknown',
      headquarters: 'Unknown',
      culture_summary: 'Information not available',
      pros: [],
      cons: [],
      overall_rating: 3.0,
      key_facts: []
    }
  }
}