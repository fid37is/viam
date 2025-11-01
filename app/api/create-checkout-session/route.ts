// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, email, priceId } = body

    console.log('Checkout request:', { userId, email, priceId })

    // Validate required fields
    if (!userId || !email || !priceId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, priceId' },
        { status: 400 }
      )
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      )
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000'
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`

    console.log('Using base URL:', baseUrl)

    const supabase = await createClient()
    
    // Get or create Stripe customer
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle() // Use maybeSingle instead of single to avoid error if no record

    if (subError) {
      console.error('Supabase error:', subError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    let customerId = subscription?.stripe_customer_id

    console.log('Existing customer ID:', customerId)

    if (!customerId) {
      console.log('Creating new Stripe customer...')
      
      const customer = await stripe.customers.create({
        email,
        metadata: { userId }
      })
      
      customerId = customer.id
      console.log('Created customer:', customerId)

      // Update subscription record with customer ID
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Failed to update subscription:', updateError)
        // Continue anyway - we have the customer ID
      }
    }

    console.log('Creating checkout session...')

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
      metadata: { userId },
      allow_promotion_codes: true, // Optional: allow promo codes
    })

    console.log('Checkout session created:', session.id)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout session error:', error)
    
    // Return more specific error info
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: error.type || 'unknown_error'
      },
      { status: 500 }
    )
  }
}