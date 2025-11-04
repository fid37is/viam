// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'
import { createClient } from '@/lib/supabase/server'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature || !endpointSecret) {
      console.error('Missing signature or webhook secret')
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Webhook event:', event.type)

    const supabase = await createClient()

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          return NextResponse.json({ received: true })
        }

        console.log('Processing subscription for user:', userId)

        // Determine tier and billing cycle from the price
        let tier = 'free'
        let billingCycle: 'monthly' | 'yearly' | null = null

        if (subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id
          
          // Map Stripe price IDs to your tier and billing cycle
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID) {
            tier = 'premium'
            billingCycle = 'monthly'
          } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID) {
            tier = 'premium'
            billingCycle = 'yearly'
          }
        }

        // Determine status
        let status = 'active'
        if (subscription.status === 'canceled' || subscription.status === 'past_due') {
          status = subscription.status
        }

        const { error: updateError } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: subscription.customer,
              stripe_subscription_id: subscription.id,
              tier,
              billing_cycle: billingCycle,
              status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
          )

        if (updateError) {
          console.error('Failed to upsert subscription:', updateError)
        }

        // Update user profile with tier
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Failed to update user profile:', profileError)
        }

        console.log(`Subscription updated for user ${userId}: tier=${tier}, cycle=${billingCycle}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          return NextResponse.json({ received: true })
        }

        console.log('Canceling subscription for user:', userId)

        // Update subscription status
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            tier: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
            billing_cycle: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (updateError) {
          console.error('Failed to update subscription:', updateError)
        }

        // Revert user profile to free tier
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Failed to update user profile:', profileError)
        }

        console.log(`Subscription canceled for user ${userId}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription

        if (!subscriptionId) {
          return NextResponse.json({ received: true })
        }

        console.log('Invoice payment succeeded for subscription:', subscriptionId)

        // Get the subscription to find the user
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (subError) {
          console.error('Failed to find subscription:', subError)
          return NextResponse.json({ received: true })
        }

        // Store invoice with correct field names
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            user_id: subData.user_id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency || 'usd',
            status: 'paid',
            invoice_pdf: invoice.invoice_pdf,
            period_start: new Date(invoice.period_start * 1000).toISOString(),
            period_end: new Date(invoice.period_end * 1000).toISOString(),
            created_at: new Date().toISOString()
          })

        if (invoiceError) {
          console.error('Failed to store invoice:', invoiceError)
        }

        console.log(`Invoice stored for user ${subData.user_id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription

        if (!subscriptionId) {
          return NextResponse.json({ received: true })
        }

        console.log('Invoice payment failed for subscription:', subscriptionId)

        // Get the subscription to find the user
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (subError) {
          console.error('Failed to find subscription:', subError)
          return NextResponse.json({ received: true })
        }

        // Store failed invoice with correct field names
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            user_id: subData.user_id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_due,
            currency: invoice.currency || 'usd',
            status: 'pending',
            invoice_pdf: invoice.invoice_pdf,
            period_start: new Date(invoice.period_start * 1000).toISOString(),
            period_end: new Date(invoice.period_end * 1000).toISOString(),
            created_at: new Date().toISOString()
          })

        if (invoiceError) {
          console.error('Failed to store invoice:', invoiceError)
        }

        // Optionally: send email notification or mark subscription as at-risk
        console.log(`Payment failed for user ${subData.user_id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}