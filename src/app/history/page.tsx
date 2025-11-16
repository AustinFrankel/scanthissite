'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import HistoryList from '@/components/HistoryList'
import type { ScanRecord } from '@/lib/supabase/types'

export default function HistoryPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserAndHistory()
  }, [])

  const loadUserAndHistory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)

    // Load history
    try {
      const response = await fetch('/api/history')
      if (response.ok) {
        const data = await response.json()
        setScans(data.scans)
      }
    } catch (err) {
      console.error('Error loading history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyShareLink = async (scanId: string) => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId }),
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

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scan History</h1>
          <p className="text-gray-600 mt-2">
            View and share your past website scans
          </p>
        </div>

        <HistoryList scans={scans} onCopyShareLink={handleCopyShareLink} />
      </main>
    </div>
  )
}

