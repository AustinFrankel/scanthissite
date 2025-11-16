import { NextRequest, NextResponse } from 'next/server'

// Temporary stub: Stripe is not configured yet.
// This endpoint simply returns an informative error so builds succeed
// even when Stripe keys are not set up.
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Stripe subscriptions are not configured yet. Please try again later.',
    },
    { status: 503 }
  )
}

