// app/api/cancel-subscription/route.ts
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
