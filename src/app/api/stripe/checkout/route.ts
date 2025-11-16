import { NextRequest, NextResponse } from 'next/server'
import { stripe, getStripePriceId, type PlanId, type BillingInterval } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, billingInterval } = body as {
      planId: PlanId
      billingInterval: BillingInterval
    }

    if (!planId || !billingInterval) {
      return NextResponse.json(
        { error: 'Missing planId or billingInterval' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId: string

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
    }

    const priceId = getStripePriceId(planId, billingInterval)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/scan?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/scan?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

