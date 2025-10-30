import axios from 'axios'
import * as cheerio from 'cheerio'

export interface ScrapedJobData {
  jobTitle: string
  companyName: string
  location: string
  description: string
  success: boolean
  error?: string
}

export async function scrapeJobPosting(url: string): Promise<ScrapedJobData> {
  try {
    // Validate URL
    const urlObj = new URL(url)
    const domain = urlObj.hostname.toLowerCase()

    // Route to appropriate scraper based on domain
    if (domain.includes('linkedin.com')) {
      return await scrapeLinkedIn(url)
    } else if (domain.includes('indeed.com')) {
      return await scrapeIndeed(url)
    } else if (domain.includes('glassdoor.com')) {
      return await scrapeGlassdoor(url)
    } else {
      // Generic scraper for other sites
      return await scrapeGeneric(url)
    }
  } catch (error: any) {
    console.error('Scraping error:', error)
    return {
      jobTitle: '',
      companyName: '',
      location: '',
      description: '',
      success: false,
      error: error.message || 'Failed to scrape job posting',
    }
  }
}

async function scrapeLinkedIn(url: string): Promise<ScrapedJobData> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    const jobTitle = $('h1.top-card-layout__title').text().trim() ||
                     $('h1.topcard__title').text().trim() ||
                     $('h1').first().text().trim()

    const companyName = $('a.topcard__org-name-link').text().trim() ||
                       $('span.topcard__flavor').text().trim() ||
                       $('.top-card-layout__card a').first().text().trim()

    const location = $('span.topcard__flavor--bullet').text().trim() ||
                    $('.top-card-layout__card span.bullet').text().trim()

    const description = $('.show-more-less-html__markup').text().trim() ||
                       $('.description__text').text().trim() ||
                       $('[class*="description"]').text().trim()

    return {
      jobTitle: jobTitle || 'Job Title Not Found',
      companyName: companyName || 'Company Not Found',
      location: location || '',
      description: description || 'Description not available',
      success: true,
    }
  } catch (error: any) {
    return {
      jobTitle: '',
      companyName: '',
      location: '',
      description: '',
      success: false,
      error: 'LinkedIn scraping failed. The page may require authentication.',
    }
  }
}

async function scrapeIndeed(url: string): Promise<ScrapedJobData> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    const jobTitle = $('h1.jobsearch-JobInfoHeader-title').text().trim() ||
                     $('[class*="jobTitle"]').first().text().trim()

    const companyName = $('[class*="company"]').first().text().trim() ||
                       $('[data-company-name]').attr('data-company-name') || ''

    const location = $('[class*="location"]').first().text().trim()

    const description = $('#jobDescriptionText').text().trim() ||
                       $('[class*="jobDescription"]').text().trim()

    return {
      jobTitle: jobTitle || 'Job Title Not Found',
      companyName: companyName || 'Company Not Found',
      location: location || '',
      description: description || 'Description not available',
      success: true,
    }
  } catch (error: any) {
    return {
      jobTitle: '',
      companyName: '',
      location: '',
      description: '',
      success: false,
      error: 'Indeed scraping failed',
    }
  }
}

async function scrapeGlassdoor(url: string): Promise<ScrapedJobData> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    const jobTitle = $('[class*="JobDetails_jobTitle"]').text().trim() ||
                     $('h1').first().text().trim()

    const companyName = $('[class*="EmployerProfile_employerName"]').text().trim() ||
                       $('[data-test="employer-name"]').text().trim()

    const location = $('[class*="JobDetails_location"]').text().trim()

    const description = $('[class*="JobDetails_jobDescription"]').text().trim() ||
                       $('.desc').text().trim()

    return {
      jobTitle: jobTitle || 'Job Title Not Found',
      companyName: companyName || 'Company Not Found',
      location: location || '',
      description: description || 'Description not available',
      success: true,
    }
  } catch (error: any) {
    return {
      jobTitle: '',
      companyName: '',
      location: '',
      description: '',
      success: false,
      error: 'Glassdoor scraping failed',
    }
  }
}

async function scrapeGeneric(url: string): Promise<ScrapedJobData> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    // Try to find job title (usually in h1 or title)
    let jobTitle = $('h1').first().text().trim()
    if (!jobTitle) {
      jobTitle = $('title').text().trim().split('|')[0].trim()
    }

    // Try common selectors for company name
    let companyName = $('[class*="company"]').first().text().trim() ||
                     $('[class*="employer"]').first().text().trim() ||
                     $('[class*="organization"]').first().text().trim()

    // Try common selectors for location
    let location = $('[class*="location"]').first().text().trim() ||
                  $('[class*="city"]').first().text().trim()

    // Try to get description from meta tags or common selectors
    let description = $('meta[name="description"]').attr('content') ||
                     $('[class*="description"]').text().trim() ||
                     $('[class*="job-description"]').text().trim() ||
                     $('article').first().text().trim() ||
                     $('main').first().text().trim()

    // Clean up description (limit length)
    if (description && description.length > 5000) {
      description = description.substring(0, 5000) + '...'
    }

    return {
      jobTitle: jobTitle || 'Job Title Not Found',
      companyName: companyName || 'Company Not Found',
      location: location || '',
      description: description || 'Description not available. Please add manually.',
      success: !!jobTitle,
    }
  } catch (error: any) {
    return {
      jobTitle: '',
      companyName: '',
      location: '',
      description: '',
      success: false,
      error: 'Generic scraping failed. The website may be blocking automated access.',
    }
  }
}

// Helper function to clean text
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
}