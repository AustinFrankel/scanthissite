import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    const supabase = await createClient()

    // Fetch scan by share_id (public access)
    const { data: scan, error } = await supabase
      .from('scan_records')
      .select('*')
      .eq('share_id', shareId)
      .eq('not_enough_data', false)
      .single()

    if (error || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    // Return only necessary public data (no user_id)
    return NextResponse.json({
      scan: {
        id: scan.id,
        url: scan.url,
        normalized_url: scan.normalized_url,
        created_at: scan.created_at,
        overall_verdict: scan.overall_verdict,
        scam_risk_score: scan.scam_risk_score,
        malware_risk_score: scan.malware_risk_score,
        review_trust_score: scan.review_trust_score,
        summary_reasons: scan.summary_reasons,
        raw_ai_result: scan.raw_ai_result,
        page_title: scan.page_title,
      },
    })
  } catch (error: any) {
    console.error('Share fetch API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

