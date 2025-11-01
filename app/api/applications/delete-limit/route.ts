import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get deletion count from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: deletionCount } = await supabase
      .from('deletion_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('deleted_at', thirtyDaysAgo.toISOString())

    const remaining = Math.max(0, 10 - (deletionCount || 0))

    return NextResponse.json({ remaining })
  } catch (error) {
    console.error('Error fetching deletion limit:', error)
    return NextResponse.json({ remaining: 0 })
  }
}