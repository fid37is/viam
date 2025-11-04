// Create this file: app/api/sync-subscriptions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Step 1: Get the subscription record
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (subError || !subscription) {
      console.error('❌ Subscription not found:', subError)
      console.log('📝 Attempting to fetch all subscriptions for user:', userId)
      
      // Try to get all subscriptions to debug
      const { data: allSubs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
      
      console.log('📋 All subscriptions for user:', allSubs)
      
      return NextResponse.json(
        { error: 'Subscription not found', details: subError?.message },
        { status: 404 }
      )
    }

    console.log('✅ Found subscription:', {
      id: subscription.id,
      tier: subscription.tier,
      stripe_subscription_id: subscription.stripe_subscription_id,
      billing_cycle: subscription.billing_cycle,
      status: subscription.status
    })

    // Step 2: Determine the tier
    // If subscription has stripe_subscription_id, they're premium
    const tier = subscription.stripe_subscription_id ? 'premium' : subscription.tier || 'free'
    const billingCycle = subscription.billing_cycle || null

    console.log('📊 Determined tier:', tier, 'Billing cycle:', billingCycle)

    // Step 3: Update the profile with the subscription tier
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (profileError) {
      console.error('❌ Failed to update profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: profileError.message },
        { status: 500 }
      )
    }

    console.log('✅ Profile updated successfully to tier:', tier)
    console.log('📊 Profile data:', profileData)

    return NextResponse.json({
      success: true,
      message: `User tier updated to: ${tier}`,
      tier,
      billingCycle,
      subscription: {
        id: subscription.id,
        stripe_subscription_id: subscription.stripe_subscription_id,
        tier: subscription.tier,
        billing_cycle: subscription.billing_cycle,
        status: subscription.status
      },
      profile: profileData
    })

  } catch (error: any) {
    console.error('❌ Sync error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to check current status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, subscription_tier, email, created_at')
      .eq('id', userId)
      .single()

    console.log('🔍 Status check for user:', userId)
    console.log('📋 Subscription:', subscription)
    console.log('👤 Profile:', profile)

    return NextResponse.json({
      subscription: subscription ? {
        id: subscription.id,
        tier: subscription.tier,
        billing_cycle: subscription.billing_cycle,
        stripe_subscription_id: subscription.stripe_subscription_id,
        status: subscription.status
      } : { error: subError?.message },
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        subscription_tier: profile.subscription_tier
      } : { error: profileError?.message }
    })

  } catch (error: any) {
    console.error('❌ Check error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}