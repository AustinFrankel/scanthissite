export type PlanId = 'essential' | 'plus' | 'pro'
export type BillingInterval = 'month' | 'year'

export interface Plan {
  id: PlanId
  name: string
  monthlyPrice: number // in cents
  yearlyPrice: number // in cents
  monthlyScanLimit: number
  description: string
}

export const PLANS: Record<PlanId, Plan> = {
  essential: {
    id: 'essential',
    name: 'Essential',
    monthlyPrice: 999, // $9.99
    yearlyPrice: 9900, // $99.00
    monthlyScanLimit: 5,
    description: '5 scans per month',
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    monthlyPrice: 1499, // $14.99
    yearlyPrice: 14900, // $149.00
    monthlyScanLimit: 10,
    description: '10 scans per month',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 1999, // $19.99
    yearlyPrice: 19900, // $199.00
    monthlyScanLimit: 50,
    description: '50 scans per month',
  },
}

export function getPlanById(planId: PlanId): Plan {
  return PLANS[planId]
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

