export type Profile = {
  id: string
  created_at: string
  updated_at: string
  full_name: string | null
  avatar_url: string | null
}

export type Subscription = {
  id: string
  user_id: string
  plan_id: 'essential' | 'plus' | 'pro'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  billing_interval: 'month' | 'year'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export type ScanRecord = {
  id: string
  user_id: string
  url: string
  normalized_url: string
  created_at: string
  overall_verdict: 'safe' | 'caution' | 'risky' | 'unknown'
  scam_risk_score: number
  malware_risk_score: number
  review_trust_score: number | null
  not_enough_data: boolean
  summary_reasons: string[] | null
  raw_ai_result: any | null
  share_id: string | null
  page_title: string | null
  meta_description: string | null
}

