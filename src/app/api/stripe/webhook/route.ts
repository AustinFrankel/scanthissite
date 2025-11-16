import { NextRequest, NextResponse } from 'next/server'

// Temporary stub: Stripe webhooks are not configured yet.
// This keeps the route present for future use but avoids requiring Stripe.
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Stripe webhooks are not configured yet. No subscription updates are being processed.',
    },
    { status: 503 }
  )
}

