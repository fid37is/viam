// app/api/cancel-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover'
})

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json()

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