'use client'

import { useState } from 'react'
import { PLANS, type BillingInterval } from '@/lib/stripe'

interface PricingSectionProps {
  onSelectPlan: (planId: string, interval: BillingInterval) => void
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [interval, setInterval] = useState<BillingInterval>('month')

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const getYearlySavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12
    const savings = monthlyTotal - yearlyPrice
    return Math.round((savings / monthlyTotal) * 100)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose your plan
        </h2>
        <p className="text-gray-600 mb-6">
          Check a website before you trust it
        </p>

        {/* Billing Interval Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setInterval('month')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              interval === 'month'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('year')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              interval === 'year'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Essential */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Essential</h3>
          <p className="text-gray-600 text-sm mb-4">
            {PLANS.essential.monthlyScanLimit} scans per month
          </p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(
                interval === 'month'
                  ? PLANS.essential.monthlyPrice
                  : PLANS.essential.yearlyPrice
              )}
            </span>
            <span className="text-gray-600 ml-2">
              / {interval === 'month' ? 'month' : 'year'}
            </span>
            {interval === 'year' && (
              <p className="text-sm text-green-600 mt-1">
                Save{' '}
                {getYearlySavings(
                  PLANS.essential.monthlyPrice,
                  PLANS.essential.yearlyPrice
                )}
                % vs monthly
              </p>
            )}
          </div>
          <button
            onClick={() => onSelectPlan('essential', interval)}
            className="w-full py-2 px-4 border border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors"
          >
            Choose plan
          </button>
        </div>

        {/* Plus (Recommended) */}
        <div className="bg-blue-50 border-2 border-primary rounded-lg p-6 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
              Recommended
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Plus</h3>
          <p className="text-gray-600 text-sm mb-4">
            {PLANS.plus.monthlyScanLimit} scans per month
          </p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(
                interval === 'month'
                  ? PLANS.plus.monthlyPrice
                  : PLANS.plus.yearlyPrice
              )}
            </span>
            <span className="text-gray-600 ml-2">
              / {interval === 'month' ? 'month' : 'year'}
            </span>
            {interval === 'year' && (
              <p className="text-sm text-green-600 mt-1">
                Save{' '}
                {getYearlySavings(
                  PLANS.plus.monthlyPrice,
                  PLANS.plus.yearlyPrice
                )}
                % vs monthly
              </p>
            )}
          </div>
          <button
            onClick={() => onSelectPlan('plus', interval)}
            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Choose plan
          </button>
        </div>

        {/* Pro */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
          <p className="text-gray-600 text-sm mb-4">
            {PLANS.pro.monthlyScanLimit} scans per month
          </p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(
                interval === 'month'
                  ? PLANS.pro.monthlyPrice
                  : PLANS.pro.yearlyPrice
              )}
            </span>
            <span className="text-gray-600 ml-2">
              / {interval === 'month' ? 'month' : 'year'}
            </span>
            {interval === 'year' && (
              <p className="text-sm text-green-600 mt-1">
                Save{' '}
                {getYearlySavings(
                  PLANS.pro.monthlyPrice,
                  PLANS.pro.yearlyPrice
                )}
                % vs monthly
              </p>
            )}
          </div>
          <button
            onClick={() => onSelectPlan('pro', interval)}
            className="w-full py-2 px-4 border border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors"
          >
            Choose plan
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>All plans include:</p>
        <ul className="mt-2 space-y-1">
          <li>Full website scan with visual safety summary</li>
          <li>Scam and malware risk evaluation</li>
          <li>Review and reputation hints</li>
          <li>Live website preview</li>
          <li>Shareable public report links</li>
          <li>Scan history</li>
        </ul>
      </div>
    </div>
  )
}

