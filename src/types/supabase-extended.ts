
// Extended types for our custom Supabase tables
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  transformation_limit: number;
  features: string[];
  paypal_plan_id_monthly?: string;
  paypal_plan_id_yearly?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  paypal_subscription_id?: string;
  status: 'pending' | 'active' | 'cancelled' | 'expired' | 'past_due';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayPalPayment {
  id: string;
  user_id: string;
  subscription_id?: string;
  paypal_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_date: string;
  created_at: string;
}
