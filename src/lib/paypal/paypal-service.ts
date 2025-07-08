
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, UserSubscription } from '@/types/supabase-extended';

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
    // For now, return mock data until the database migration is run
    return [
      {
        id: 'free',
        name: 'Free',
        description: 'Perfect for trying out NeuroLint',
        price_monthly: 0,
        price_yearly: 0,
        transformation_limit: 25,
        features: ['Basic code analysis', 'Up to 25 transformations/month', 'Community support']
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'For individual developers and small teams',
        price_monthly: 19.99,
        price_yearly: 199.99,
        transformation_limit: 500,
        features: ['Advanced code analysis', 'Up to 500 transformations/month', 'Priority support', 'Custom rules', 'Export reports']
      },
      {
        id: 'team',
        name: 'Team',
        description: 'For growing development teams',
        price_monthly: 49.99,
        price_yearly: 499.99,
        transformation_limit: 2000,
        features: ['Everything in Pro', 'Up to 2000 transformations/month', 'Team collaboration', 'Advanced analytics', 'API access']
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price_monthly: 149.99,
        price_yearly: 1499.99,
        transformation_limit: 10000,
        features: ['Everything in Team', 'Up to 10000 transformations/month', 'Dedicated support', 'Custom integrations', 'On-premise deployment', 'SLA guarantee']
      }
    ];
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<PayPalSubscriptionResponse> {
    try {
      // Get the plan details
      const plans = await this.getSubscriptionPlans();
      const plan = plans.find(p => p.id === request.planId);

      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Create subscription via edge function
      const response = await supabase.functions.invoke('create-paypal-subscription', {
        body: {
          planId: plan.paypal_plan_id_yearly || plan.paypal_plan_id_monthly || 'mock-plan-id',
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
    // Mock user subscription data for now
    return {
      plan_name: 'Free',
      transformation_limit: 25,
      current_usage: 5,
      status: 'active',
      period_end: null
    };
  }

  async getMonthlyUsage(): Promise<number> {
    // Mock usage data for now
    return 5;
  }
}

export const paypalService = new PayPalService();
