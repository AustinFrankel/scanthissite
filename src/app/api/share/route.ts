import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

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
    const { scanId } = body

    if (!scanId) {
      return NextResponse.json({ error: 'Missing scanId' }, { status: 400 })
    }

    // Get the scan record
    const { data: scan, error: fetchError } = await supabase
      .from('scan_records')
      .select('*')
      .eq('id', scanId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    // If share_id already exists, return it
    if (scan.share_id) {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan?shareId=${scan.share_id}`
      return NextResponse.json({ shareUrl, shareId: scan.share_id })
    }

    // Generate a unique share_id
    const shareId = randomBytes(16).toString('hex')

    // Update the scan record
    const { error: updateError } = await supabase
      .from('scan_records')
      .update({ share_id: shareId })
      .eq('id', scanId)

    if (updateError) {
      console.error('Error updating share_id:', updateError)
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      )
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan?shareId=${shareId}`
    return NextResponse.json({ shareUrl, shareId })
  } catch (error: any) {
    console.error('Share API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

