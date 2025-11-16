'use client'

import Link from 'next/link'
import type { ScanRecord } from '@/lib/supabase/types'

interface HistoryListProps {
  scans: ScanRecord[]
  onCopyShareLink: (scanId: string) => void
}

export default function HistoryList({
  scans,
  onCopyShareLink,
}: HistoryListProps) {
  const getVerdictDisplay = (verdict: string) => {
    switch (verdict) {
      case 'safe':
        return { text: 'Safe', color: 'text-green-600' }
      case 'caution':
        return { text: 'Caution', color: 'text-yellow-600' }
      case 'risky':
        return { text: 'Risky', color: 'text-red-600' }
      default:
        return { text: 'Unknown', color: 'text-gray-600' }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (scans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No scans yet</p>
        <Link
          href="/scan"
          className="text-primary hover:text-blue-600 mt-2 inline-block"
        >
          Scan your first website
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verdict
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scans.map((scan) => {
              const verdict = getVerdictDisplay(scan.overall_verdict)
              return (
                <tr key={scan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-md truncate text-sm text-gray-900">
                      {scan.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${verdict.color}`}>
                      {verdict.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(scan.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/scan?scanId=${scan.id}`}
                      className="text-primary hover:text-blue-600 mr-4"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => onCopyShareLink(scan.id)}
                      className="text-primary hover:text-blue-600"
                    >
                      Copy link
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {scans.map((scan) => {
          const verdict = getVerdictDisplay(scan.overall_verdict)
          return (
            <div
              key={scan.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="mb-2">
                <p className="text-sm text-gray-900 truncate">{scan.url}</p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${verdict.color}`}>
                  {verdict.text}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(scan.created_at)}
                </span>
              </div>
              <div className="flex space-x-4">
                <Link
                  href={`/scan?scanId=${scan.id}`}
                  className="text-primary hover:text-blue-600 text-sm"
                >
                  View
                </Link>
                <button
                  onClick={() => onCopyShareLink(scan.id)}
                  className="text-primary hover:text-blue-600 text-sm"
                >
                  Copy link
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

