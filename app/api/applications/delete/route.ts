import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { ids, userPlan } = await req.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'No applications to delete' }, { status: 400 })
    }

    // Delete applications
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id)

    if (deleteError) {
      throw deleteError
    }

    // Log deletion for free tier
    if (userPlan === 'free') {
      await supabase.from('deletion_log').insert(
        ids.map(id => ({
          user_id: user.id,
          application_id: id,
          deleted_at: new Date().toISOString(),
        }))
      )

      // Get remaining deletions
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: deletionCount } = await supabase
        .from('deletion_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('deleted_at', thirtyDaysAgo.toISOString())

      const remaining = Math.max(0, 10 - (deletionCount || 0))

      return NextResponse.json({ success: true, deletionsRemaining: remaining })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete applications' },
      { status: 500 }
    )
  }
}