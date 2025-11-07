// app/api/research-company/route.ts (FIXED - non-blocking)
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Function to do the actual research (runs in background)
async function performResearch(companyName: string, website: string | null, applicationId: string | null) {
  try {
    const supabase = await createClient()

    console.log(`[BACKGROUND] Researching company: ${companyName}`)

    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check cache
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (existingCompany?.last_researched_at) {
      const lastResearched = new Date(existingCompany.last_researched_at)
      const daysSince = (Date.now() - lastResearched.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSince < 30) {
        console.log(`[BACKGROUND] Using cached data for: ${companyName}`)
        // Link to application if needed
        if (applicationId && existingCompany.id) {
          await supabase
            .from('applications')
            .update({ company_id: existingCompany.id })
            .eq('id', applicationId)
        }
        return
      }
    }

    // Call external scraper with timeout
    const scraperUrl = `${process.env.NEXT_PUBLIC_SCRAPER_URL || 'https://owtra-scraper.vercel.app'}/api/research?company=${encodeURIComponent(companyName)}`

    console.log(`[BACKGROUND] Calling owtra-scraper: ${scraperUrl}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const scraperResponse = await fetch(scraperUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Owtra/1.0)',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!scraperResponse.ok) {
        const errorText = await scraperResponse.text()
        console.error('[BACKGROUND] Scraper error:', errorText)
        return
      }

      const scraperData = await scraperResponse.json()

      if (!scraperData.success || !scraperData.data) {
        console.error('[BACKGROUND] No data from scraper')
        return
      }

      const scrapedData = scraperData.data

      const companyData = {
        name: scrapedData.companyName || companyName,
        slug,
        website: scrapedData.website || website || null,
        description: scrapedData.description || 'No description available',
        industry: scrapedData.industry || 'Unknown',
        company_size: scrapedData.companySize || scrapedData.company_size || 'Unknown',
        headquarters: scrapedData.headquarters || 'Unknown',
        founded_year: scrapedData.foundedYear || scrapedData.founded_year || null,
        culture_summary: scrapedData.cultureSummary || scrapedData.culture_summary || 'Information not available',
        pros: scrapedData.pros || [],
        cons: scrapedData.cons || [],
        overall_rating: scrapedData.overallRating || scrapedData.overall_rating || 3.0,
        linkedin_url: scrapedData.linkedinUrl || scrapedData.linkedin_url || null,
        glassdoor_url: scrapedData.glassdoorUrl || scrapedData.glassdoor_url || null,
        last_researched_at: new Date().toISOString(),
      }

      console.log('[BACKGROUND] Saving company data:', companyData.name)

      const { data: company, error: upsertError } = await supabase
        .from('companies')
        .upsert(companyData, {
          onConflict: 'slug',
        })
        .select()
        .single()

      if (upsertError) {
        console.error('[BACKGROUND] Failed to save company:', upsertError.message)
        return
      }

      console.log(`[BACKGROUND] Successfully saved company: ${company.name}`)

      // Link to application
      if (applicationId && company.id) {
        const { error: updateError } = await supabase
          .from('applications')
          .update({ company_id: company.id })
          .eq('id', applicationId)

        if (updateError) {
          console.error('[BACKGROUND] Failed to link company:', updateError.message)
        } else {
          console.log(`[BACKGROUND] Linked company to application`)
        }
      }
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        console.error('[BACKGROUND] Scraper request timed out')
      } else {
        console.error('[BACKGROUND] Fetch error:', fetchError.message)
      }
    }
  } catch (error: any) {
    console.error('[BACKGROUND] Research error:', error.message)
  }
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

    const { companyName, website, applicationId } = await request.json()

    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 })
    }

    console.log(`Research requested for: ${companyName}`)

    // IMPORTANT: Start background research but don't wait for it
    // This allows the API to respond immediately
    performResearch(companyName, website, applicationId).catch(err => {
      console.error('Background research failed:', err)
    })

    // Return immediately with success
    return NextResponse.json({
      success: true,
      message: 'Company research started in background',
    })

  } catch (error: any) {
    console.error('Research API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start research' },
      { status: 500 }
    )
  }
}