// app/api/admin/stats/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Fetch all counts
    const [
      { count: totalUsers },
      { count: premiumUsers },
      { count: activeSubscriptions },
      { count: totalApplications },
      { data: invoices }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('tier', 'premium'),
      supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('tier', 'premium').eq('status', 'active'),
      supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('invoices').select('amount, status')
    ])

    const totalRevenue = invoices
      ?.filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0

    const { data: activeMonthly } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('tier', 'premium')
      .eq('status', 'active')
      .eq('billing_cycle', 'monthly')

    const monthlyRecurringRevenue = (activeMonthly?.length || 0) * 12

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      premiumUsers: premiumUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalApplicationsTracked: totalApplications || 0,
      totalRevenue: totalRevenue / 100,
      monthlyRecurringRevenue
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}