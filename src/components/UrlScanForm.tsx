'use client'

import { useState } from 'react'

interface UrlScanFormProps {
  onScan: (url: string) => void
  isLoading: boolean
  scansRemaining?: number
  scansTotal?: number
}

export default function UrlScanForm({
  onScan,
  isLoading,
  scansRemaining,
  scansTotal,
}: UrlScanFormProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onScan(url.trim())
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Scan this site"
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Scanning...' : 'Scan'}
          </button>

          {scansRemaining !== undefined && scansTotal !== undefined && (
            <p className="text-sm text-gray-600">
              You have {scansRemaining} of {scansTotal} scans left this month
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

