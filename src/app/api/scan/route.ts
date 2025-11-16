import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchWebsite } from '@/lib/website-fetcher'
import { analyzeWebsite } from '@/lib/openai'
import { getPlanById } from '@/lib/stripe'
import type { Subscription } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 403 }
      )
    }

    const sub = subscription as Subscription

    // Check if subscription is expired
    const now = new Date()
    const periodEnd = new Date(sub.current_period_end)
    if (periodEnd < now) {
      return NextResponse.json(
        { error: 'Subscription expired' },
        { status: 403 }
      )
    }

    // Get plan details
    const plan = getPlanById(sub.plan_id)

    // Count scans in current billing period
    const { count, error: countError } = await supabase
      .from('scan_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('not_enough_data', false)
      .gte('created_at', sub.current_period_start)
      .lte('created_at', sub.current_period_end)

    if (countError) {
      console.error('Error counting scans:', countError)
      return NextResponse.json(
        { error: 'Failed to check scan quota' },
        { status: 500 }
      )
    }

    const scansUsed = count || 0

    if (scansUsed >= plan.monthlyScanLimit) {
      return NextResponse.json(
        {
          error: "You've used all scans for this month",
          scansUsed,
          scansTotal: plan.monthlyScanLimit,
        },
        { status: 403 }
      )
    }

    // Get URL from request
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Fetch website
    let fetchedSite
    try {
      fetchedSite = await fetchWebsite(url)
    } catch (error: any) {
      return NextResponse.json(
        {
          error:
            error.message ||
            'We couldn't load this website. Please check the URL and try again.',
        },
        { status: 400 }
      )
    }

    // Analyze with OpenAI
    let aiResult
    try {
      aiResult = await analyzeWebsite({
        url: fetchedSite.normalizedUrl,
        domain: fetchedSite.domain,
        pageTitle: fetchedSite.pageTitle,
        metaDescription: fetchedSite.metaDescription,
        pageTextSample: fetchedSite.pageTextSample,
        fetchedAt: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error('OpenAI analysis error:', error)
      return NextResponse.json(
        {
          error:
            'We couldn't analyze this site right now. Please try again later.',
        },
        { status: 500 }
      )
    }

    // If not enough data, return result without saving
    if (aiResult.notEnoughData) {
      return NextResponse.json({
        scanId: null,
        result: aiResult,
        normalizedUrl: fetchedSite.normalizedUrl,
        pageTitle: fetchedSite.pageTitle,
        remainingScans: plan.monthlyScanLimit - scansUsed,
        totalScans: plan.monthlyScanLimit,
        notEnoughData: true,
      })
    }

    // Save scan record
    const { data: scanRecord, error: insertError } = await supabase
      .from('scan_records')
      .insert({
        user_id: user.id,
        url: fetchedSite.url,
        normalized_url: fetchedSite.normalizedUrl,
        overall_verdict: aiResult.overallVerdict,
        scam_risk_score: aiResult.scamRiskScore,
        malware_risk_score: aiResult.malwareRiskScore,
        review_trust_score: aiResult.reviewTrustScore,
        not_enough_data: false,
        summary_reasons: aiResult.keyReasons,
        raw_ai_result: aiResult,
        page_title: fetchedSite.pageTitle,
        meta_description: fetchedSite.metaDescription,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving scan:', insertError)
      return NextResponse.json(
        { error: 'Failed to save scan' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      scanId: scanRecord.id,
      result: aiResult,
      normalizedUrl: fetchedSite.normalizedUrl,
      pageTitle: fetchedSite.pageTitle,
      remainingScans: plan.monthlyScanLimit - (scansUsed + 1),
      totalScans: plan.monthlyScanLimit,
      notEnoughData: false,
    })
  } catch (error: any) {
    console.error('Scan API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

