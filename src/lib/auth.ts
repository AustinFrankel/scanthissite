import { createClient } from './supabase/server'
import type { Subscription } from './supabase/types'

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error) return null
  return data as Subscription
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getSubscription(userId)
  if (!subscription) return false

  // Check if subscription is active and not expired
  const now = new Date()
  const periodEnd = new Date(subscription.current_period_end)
  return subscription.status === 'active' && periodEnd > now
}

