// app/api/create-checkout-session/route.ts - ADD THIS AFTER SUCCESSFUL CHECKOUT

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, email, priceId, billingCycle } = body

    console.log('Checkout request:', { userId, email, priceId, billingCycle })

    if (!userId || !email || !priceId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, priceId, billingCycle' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be "monthly" or "yearly"' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      )
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000'
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`

    const supabase = await createClient()
    
    // Get or create Stripe customer
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (subError) {
      console.error('Supabase error:', subError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId }
      })
      
      customerId = customer.id

      // Upsert subscription record with customer ID
      const { error: updateError } = await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            tier: 'free',
            billing_cycle: null,
            status: 'active'
          },
          { onConflict: 'user_id' }
        )

      if (updateError) {
        console.error('Failed to create subscription record:', updateError)
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?upgrade=success`,
      cancel_url: `${baseUrl}/billing?upgrade=canceled`,
      metadata: {
        userId,
        billingCycle
      },
      allow_promotion_codes: true,
    })

    console.log('Checkout session created:', session.id)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout session error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: error.type || 'unknown_error'
      },
      { status: 500 }
    )
  }
}

// NEW: Add a route to manually update profile based on subscription status
export async function PUT(req: NextRequest) {
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

    // Get subscription data from Stripe via Supabase
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (subError || !subscription) {
      console.error('Subscription not found:', subError)
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Determine tier based on subscription
    const tier = subscription.tier || 'free'

    // Update profile with subscription tier
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (profileError) {
      console.error('Failed to update profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    console.log('Profile updated:', profileData)

    return NextResponse.json({ 
      success: true, 
      profile: profileData,
      subscription: subscription
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}