import { NextResponse } from 'next/server'
import { scrapeJobPosting } from '@/lib/scrapers/job-scraper'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Scrape the job posting
    const result = await scrapeJobPosting(url)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to scrape job posting',
          jobTitle: result.jobTitle,
          companyName: result.companyName,
          location: result.location,
          description: result.description,
        },
        { status: 200 } // Still return 200 so partial data can be used
      )
    }

    return NextResponse.json({
      success: true,
      jobTitle: result.jobTitle,
      companyName: result.companyName,
      location: result.location,
      description: result.description,
    })
  } catch (error: any) {
    console.error('Scrape job error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to scrape job' },
      { status: 500 }
    )
  }
}