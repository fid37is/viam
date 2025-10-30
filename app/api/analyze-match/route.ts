// app/api/analyze-match/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeJobMatch } from '@/lib/ai/match-analyzer'
import { isAIConfigured, getAIProvider, getProviderName } from '@/lib/ai/providers'

export async function POST(request: Request) {
    try {
        // Check if AI is configured
        if (!isAIConfigured()) {
            const provider = getAIProvider()
            return NextResponse.json(
                {
                    error: `AI provider ${getProviderName(provider)} is not configured. Please add the API key to your environment variables.`
                },
                { status: 503 }
            )
        }

        const supabase = await createClient()

        // Verify authentication
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { applicationId, jobTitle, companyName, location, jobDescription } = body

        let jobData: {
            job_title: string
            company_name: string
            location: string | null
            job_description: string
        }

        // Two modes: analyze existing application OR analyze before saving
        if (applicationId) {
            // MODE 1: Analyze existing application
            const { data: application, error: appError } = await supabase
                .from('applications')
                .select('*')
                .eq('id', applicationId)
                .eq('user_id', user.id)
                .single()

            if (appError || !application) {
                return NextResponse.json({ error: 'Application not found' }, { status: 404 })
            }

            jobData = {
                job_title: application.job_title,
                company_name: application.company_name,
                location: application.location,
                job_description: application.job_description ?? ''
            }
        } else if (jobTitle && companyName) {
            // MODE 2: Analyze before saving (preview mode)
            jobData = {
                job_title: jobTitle,
                company_name: companyName,
                location: location || null,
                job_description: jobDescription || ''
            }
        } else {
            return NextResponse.json(
                { error: 'Either applicationId or job details (jobTitle, companyName) required' },
                { status: 400 }
            )
        }

        // Check if job description exists and is sufficient
        if (!jobData.job_description || jobData.job_description.trim().length < 100) {
            return NextResponse.json(
                { error: 'Job description is too short or missing. Please add more details to enable AI analysis.' },
                { status: 400 }
            )
        }

        // Fetch user preferences
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('top_values, deal_breakers, work_location_preference, preferred_company_size, preferred_industries')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const hasPreferences =
            (Array.isArray(profile.top_values) && profile.top_values.length > 0) ||
            (Array.isArray(profile.deal_breakers) && profile.deal_breakers.length > 0) ||
            profile.work_location_preference ||
            profile.preferred_company_size ||
            (Array.isArray(profile.preferred_industries) && profile.preferred_industries.length > 0)

        if (!hasPreferences) {
            return NextResponse.json({
                matchScore: null,
                analysis: {
                    strengths: [],
                    concerns: [],
                    recommendations: ['Set your job preferences to get personalized match insights'],
                    summary: 'Complete your profile preferences to receive AI-powered job matching analysis.'
                }
            })
        }

     // Perform AI analysis with type-safe casting
        const analysis = await analyzeJobMatch(
            jobData.job_title,
            jobData.company_name,
            jobData.job_description,
            jobData.location,
            {
                top_values: Array.isArray(profile.top_values) ? profile.top_values as string[] : [],
                deal_breakers: Array.isArray(profile.deal_breakers) ? profile.deal_breakers as string[] : [],
                work_location_preference: profile.work_location_preference,
                preferred_company_size: profile.preferred_company_size,
                preferred_industries: profile.preferred_industries,
            }
        )

        // If analyzing existing application, update it
        if (applicationId) {
            const { error: updateError } = await supabase
                .from('applications')
                .update({
                    match_score: analysis.match_score,
                    match_analysis: JSON.parse(JSON.stringify(analysis)),
                })
                .eq('id', applicationId)

            if (updateError) {
                console.error('Failed to update application:', updateError)
                return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
            }
        }

        // Return analysis (will be saved by caller if in preview mode)
        return NextResponse.json({
            success: true,
            matchScore: analysis.match_score,
            analysis
        })
    } catch (error: any) {
        console.error('Match analysis error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to analyze match' },
            { status: 500 }
        )
    }
}