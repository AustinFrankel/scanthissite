'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import UrlScanForm from '@/components/UrlScanForm'
import ScanResultView from '@/components/ScanResultView'
import SitePreviewFrame from '@/components/SitePreviewFrame'
import PricingSection from '@/components/PricingSection'
import type { AIAnalysisResult } from '@/lib/openai'
import type { BillingInterval, PlanId } from '@/lib/stripe'

export default function ScanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [scanResult, setScanResult] = useState<{
    result: AIAnalysisResult
    url: string
    scanId: string | null
    scansRemaining: number
    scansTotal: number
  } | null>(null)
  const [isPublicView, setIsPublicView] = useState(false)

  useEffect(() => {
    loadUserAndSubscription()
    checkForSharedOrSavedScan()
  }, [searchParams])

  const loadUserAndSubscription = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      setHasSubscription(!!sub)
    }

    setLoading(false)
  }

  const checkForSharedOrSavedScan = async () => {
    const shareId = searchParams.get('shareId')
    const scanId = searchParams.get('scanId')

    if (shareId) {
      // Load shared scan (public)
      setIsPublicView(true)
      try {
        const response = await fetch(`/api/share/${shareId}`)
        if (response.ok) {
          const data = await response.json()
          setScanResult({
            result: data.scan.raw_ai_result,
            url: data.scan.normalized_url,
            scanId: null,
            scansRemaining: 0,
            scansTotal: 0,
          })
        }
      } catch (err) {
        console.error('Error loading shared scan:', err)
      }
    } else if (scanId && user) {
      // Load user's saved scan
      try {
        const { data: scan } = await supabase
          .from('scan_records')
          .select('*')
          .eq('id', scanId)
          .eq('user_id', user.id)
          .single()

        if (scan) {
          setScanResult({
            result: scan.raw_ai_result,
            url: scan.normalized_url,
            scanId: scan.id,
            scansRemaining: 0,
            scansTotal: 0,
          })
        }
      } catch (err) {
        console.error('Error loading saved scan:', err)
      }
    }
  }

  const handleScan = async (url: string) => {
    setScanning(true)
    setError('')
    setScanResult(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Scan failed')
      }

      setScanResult({
        result: data.result,
        url: data.normalizedUrl,
        scanId: data.scanId,
        scansRemaining: data.remainingScans,
        scansTotal: data.totalScans,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  const handleSelectPlan = async (planId: PlanId, interval: BillingInterval) => {
    if (!user) {
      router.push('/login')
      return
    }

    setError('')

    // Since Stripe is not configured yet, we simulate an active subscription
    // by directly creating/updating a subscription row in Supabase.
    try {
      const now = new Date()
      const periodStart = now.toISOString()
      const periodEndDate = new Date(now)
      if (interval === 'year') {
        periodEndDate.setFullYear(periodEndDate.getFullYear() + 1)
      } else {
        periodEndDate.setMonth(periodEndDate.getMonth() + 1)
      }
      const periodEnd = periodEndDate.toISOString()

      const { error: upsertError } = await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: user.id,
            plan_id: planId,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            status: 'active',
            billing_interval: interval,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          },
          { onConflict: 'user_id' }
        )

      if (upsertError) {
        console.error('Error creating local subscription:', upsertError)
        setError('Failed to activate plan. Please try again.')
        return
      }

      setHasSubscription(true)
    } catch (err) {
      console.error('Error creating local subscription:', err)
      setError('Failed to activate plan. Please try again.')
    }
  }

  const handleCopyShareLink = async () => {
    if (!scanResult?.scanId) return

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId: scanResult.scanId }),
      })

      const data = await response.json()

      if (data.shareUrl) {
        await navigator.clipboard.writeText(data.shareUrl)
        alert('Share link copied to clipboard!')
      }
    } catch (err) {
      console.error('Error creating share link:', err)
      alert('Failed to create share link')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Public share view
  if (isPublicView) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="text-xl font-bold text-gray-900">
                ScanThisSite
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {scanResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <SitePreviewFrame url={scanResult.url} />
              </div>
              <div>
                <ScanResultView
                  result={scanResult.result}
                  url={scanResult.url}
                  isPublic={true}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  // User needs to be logged in
  if (!user) {
    router.push('/login')
    return null
  }

  // User needs subscription
  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-white">
        <Header user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PricingSection onSelectPlan={handleSelectPlan} />
        </main>
      </div>
    )
  }

  // Main scan interface
  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <UrlScanForm
            onScan={handleScan}
            isLoading={scanning}
            scansRemaining={scanResult?.scansRemaining}
            scansTotal={scanResult?.scansTotal}
          />
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="order-2 lg:order-1">
              <SitePreviewFrame url={scanResult.url} />
            </div>
            <div className="order-1 lg:order-2">
              <ScanResultView
                result={scanResult.result}
                url={scanResult.url}
                onCopyShareLink={
                  scanResult.scanId ? handleCopyShareLink : undefined
                }
              />
            </div>
          </div>
        )}

        {!scanResult && !scanning && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Enter a URL above to scan a website
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

