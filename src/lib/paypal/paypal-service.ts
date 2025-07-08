
import { supabase } from '@/integrations/supabase/client';

export interface PayPalSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  transformation_limit: number;
  features: string[];
  paypal_plan_id_monthly?: string;
  paypal_plan_id_yearly?: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalSubscriptionResponse {
  subscriptionId: string;
  approvalUrl: string;
  status: string;
}

class PayPalService {
  private baseUrl: string;

  constructor() {
    // In production, this would be determined by environment
    this.baseUrl = 'https://api.sandbox.paypal.com';
  }

  async getSubscriptionPlans(): Promise<PayPalSubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      throw new Error('Failed to fetch subscription plans');
    }

    return data || [];
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<PayPalSubscriptionResponse> {
    try {
      // Get the plan details
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', request.planId)
        .single();

      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Get PayPal plan ID based on billing cycle
      const paypalPlanId = request.billingCycle === 'yearly' 
        ? plan.paypal_plan_id_yearly 
        : plan.paypal_plan_id_monthly;

      if (!paypalPlanId) {
        throw new Error('PayPal plan ID not configured for this billing cycle');
      }

      // Create subscription via edge function
      const response = await supabase.functions.invoke('create-paypal-subscription', {
        body: {
          planId: paypalPlanId,
          returnUrl: request.returnUrl,
          cancelUrl: request.cancelUrl,
          userPlanId: request.planId,
          billingCycle: request.billingCycle
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create subscription');
      }

      return response.data;
    } catch (error) {
      console.error('PayPal subscription creation error:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('cancel-paypal-subscription', {
        body: { subscriptionId }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to cancel subscription');
      }

      return response.data.success;
    } catch (error) {
      console.error('PayPal subscription cancellation error:', error);
      throw error;
    }
  }

  async getUserSubscription() {
    const { data: userSub } = await supabase
      .rpc('get_user_subscription_details')
      .single();

    return userSub;
  }

  async getMonthlyUsage(): Promise<number> {
    const { data: usage } = await supabase
      .rpc('get_monthly_usage')
      .single();

    return usage || 0;
  }
}

export const paypalService = new PayPalService();
