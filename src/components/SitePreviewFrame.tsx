'use client'

import { useState } from 'react'

interface SitePreviewFrameProps {
  url: string
}

export default function SitePreviewFrame({ url }: SitePreviewFrameProps) {
  const [isBlocked, setIsBlocked] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <p className="text-sm text-gray-600 truncate">{url}</p>
      </div>
      <div className="relative min-h-[300px] md:min-h-[500px]">
        {!isBlocked ? (
          <iframe
            src={url}
            className="w-full h-[300px] md:h-[500px]"
            sandbox="allow-scripts allow-same-origin"
            onError={() => setIsBlocked(true)}
            title="Website preview"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] md:h-[500px] text-gray-500">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">Preview not available for this site</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

