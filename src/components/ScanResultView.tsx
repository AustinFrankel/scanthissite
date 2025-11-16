'use client'

import type { AIAnalysisResult } from '@/lib/openai'

interface ScanResultViewProps {
  result: AIAnalysisResult
  url: string
  onCopyShareLink?: () => void
  isPublic?: boolean
}

export default function ScanResultView({
  result,
  url,
  onCopyShareLink,
  isPublic = false,
}: ScanResultViewProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'safe':
        return 'text-green-700 border-green-200 bg-green-50'
      case 'caution':
        return 'text-yellow-700 border-yellow-200 bg-yellow-50'
      case 'risky':
        return 'text-red-700 border-red-200 bg-red-50'
      default:
        return 'text-gray-700 border-gray-200 bg-gray-50'
    }
  }

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case 'safe':
        return 'Looks mostly safe'
      case 'caution':
        return 'Be careful'
      case 'risky':
        return 'Risky'
      default:
        return 'Unknown'
    }
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { text: 'High', color: 'text-red-600' }
    if (score >= 40) return { text: 'Medium', color: 'text-yellow-600' }
    return { text: 'Low', color: 'text-green-600' }
  }

  const getTrustLevel = (score: number) => {
    if (score >= 70) return { text: 'High', color: 'text-green-600' }
    if (score >= 40) return { text: 'Medium', color: 'text-yellow-600' }
    return { text: 'Low', color: 'text-red-600' }
  }

  if (result.notEnoughData) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Not enough data to decide
          </h3>
          <p className="text-gray-600">
            We couldn't find enough information to judge this website.
          </p>
        </div>
      </div>
    )
  }

  const verdictColor = getVerdictColor(result.overallVerdict)
  const scamRisk = getRiskLevel(result.scamRiskScore)
  const malwareRisk = getRiskLevel(result.malwareRiskScore)
  const trustLevel = getTrustLevel(result.reviewTrustScore)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Verdict Banner */}
      <div className={`border rounded-lg p-6 ${verdictColor}`}>
        <h2 className="text-2xl font-bold mb-2">
          {getVerdictText(result.overallVerdict)}
        </h2>
        <p className="text-sm opacity-90">{url}</p>
      </div>

      {/* Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scam Risk */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Scam risk</h3>
          <p className={`text-2xl font-bold ${scamRisk.color}`}>
            {scamRisk.text}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Score: {result.scamRiskScore}/100
          </p>
        </div>

        {/* Malware Risk */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Malware risk
          </h3>
          <p className={`text-2xl font-bold ${malwareRisk.color}`}>
            {malwareRisk.text}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Score: {result.malwareRiskScore}/100
          </p>
        </div>

        {/* Review Trust */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Review trust
          </h3>
          <p className={`text-2xl font-bold ${trustLevel.color}`}>
            {trustLevel.text}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Score: {result.reviewTrustScore}/100
          </p>
        </div>
      </div>

      {/* Key Reasons */}
      {result.keyReasons && result.keyReasons.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Key findings
          </h3>
          <ul className="space-y-2">
            {result.keyReasons.map((reason, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-gray-700">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content Notes */}
      {result.contentNotes && result.contentNotes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Content trustworthiness
          </h3>
          <ul className="space-y-2">
            {result.contentNotes.map((note, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-gray-700">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review Notes */}
      {result.reviewAndReputationNotes &&
        result.reviewAndReputationNotes.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Reviews and reputation
            </h3>
            <ul className="space-y-2">
              {result.reviewAndReputationNotes.map((note, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-gray-700">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Share Button */}
      {!isPublic && onCopyShareLink && (
        <div className="text-center">
          <button
            onClick={onCopyShareLink}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Copy share link
          </button>
        </div>
      )}
    </div>
  )
}

