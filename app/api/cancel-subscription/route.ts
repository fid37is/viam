// app/api/cancel-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}