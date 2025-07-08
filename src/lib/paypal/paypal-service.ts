import { supabase } from "@/integrations/supabase/client";

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
  billingCycle: "monthly" | "yearly";
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
    this.baseUrl = "https://api.sandbox.paypal.com";
  }

  async getSubscriptionPlans(): Promise<PayPalSubscriptionPlan[]> {
    try {
      // Try to fetch from Supabase first
      const { data: plans, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });

      if (error) {
        console.warn(
          "Failed to fetch plans from Supabase, using fallback:",
          error,
        );
        return this.getFallbackPlans();
      }

      if (plans && plans.length > 0) {
        return plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || "",
          price_monthly: Number(plan.price_monthly),
          price_yearly: Number(plan.price_yearly || 0),
          transformation_limit: plan.transformation_limit,
          features: Array.isArray(plan.features) ? plan.features : [],
          paypal_plan_id_monthly: plan.paypal_plan_id_monthly,
          paypal_plan_id_yearly: plan.paypal_plan_id_yearly,
        }));
      }

      return this.getFallbackPlans();
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      return this.getFallbackPlans();
    }
  }

  private getFallbackPlans(): PayPalSubscriptionPlan[] {
    return [
      {
        id: "free",
        name: "Free",
        description: "Perfect for trying out NeuroLint",
        price_monthly: 0,
        price_yearly: 0,
        transformation_limit: 25,
        features: [
          "Basic code analysis",
          "Up to 25 transformations/month",
          "Community support",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        description: "For individual developers and small teams",
        price_monthly: 19.99,
        price_yearly: 199.99,
        transformation_limit: 500,
        features: [
          "Advanced code analysis",
          "Up to 500 transformations/month",
          "Priority support",
          "Custom rules",
          "Export reports",
        ],
      },
      {
        id: "team",
        name: "Team",
        description: "For growing development teams",
        price_monthly: 49.99,
        price_yearly: 499.99,
        transformation_limit: 2000,
        features: [
          "Everything in Pro",
          "Up to 2000 transformations/month",
          "Team collaboration",
          "Advanced analytics",
          "API access",
        ],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        description: "For large organizations",
        price_monthly: 149.99,
        price_yearly: 1499.99,
        transformation_limit: 10000,
        features: [
          "Everything in Team",
          "Up to 10000 transformations/month",
          "Dedicated support",
          "Custom integrations",
          "On-premise deployment",
          "SLA guarantee",
        ],
      },
    ];
  }

  async createSubscription(
    request: CreateSubscriptionRequest,
  ): Promise<PayPalSubscriptionResponse> {
    try {
      const plans = await this.getSubscriptionPlans();
      const plan = plans.find((p) => p.id === request.planId);

      if (!plan) {
        throw new Error("Subscription plan not found");
      }

      const response = await supabase.functions.invoke(
        "create-paypal-subscription",
        {
          body: {
            planId:
              plan.paypal_plan_id_yearly ||
              plan.paypal_plan_id_monthly ||
              "mock-plan-id",
            returnUrl: request.returnUrl,
            cancelUrl: request.cancelUrl,
            userPlanId: request.planId,
            billingCycle: request.billingCycle,
          },
        },
      );

      if (response.error) {
        throw new Error(
          response.error.message || "Failed to create subscription",
        );
      }

      return response.data;
    } catch (error) {
      console.error("PayPal subscription creation error:", error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke(
        "cancel-paypal-subscription",
        {
          body: { subscriptionId },
        },
      );

      if (response.error) {
        throw new Error(
          response.error.message || "Failed to cancel subscription",
        );
      }

      return response.data.success;
    } catch (error) {
      console.error("PayPal subscription cancellation error:", error);
      throw error;
    }
  }

  async getUserSubscription() {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        throw new Error("User not authenticated");
      }

      // Get user subscription details using the database function
      const { data, error } = await supabase.rpc(
        "get_user_subscription_details",
        { user_uuid: user.user.id },
      );

      if (error) {
        console.warn(
          "Database function not available or failed:",
          error.message || error,
        );
        // Instead of throwing, fallback to checking user_subscriptions table directly
        return await this.getUserSubscriptionFallback(user.user.id);
      }

      if (data && data.length > 0) {
        const subscription = data[0];
        return {
          plan_name: subscription.plan_name,
          plan_id: subscription.plan_id,
          transformation_limit: subscription.transformation_limit,
          current_usage: subscription.current_usage,
          remaining_transformations: subscription.remaining_transformations,
          status: subscription.status,
          period_end: subscription.period_end,
          billing_cycle: subscription.billing_cycle,
          can_transform: subscription.can_transform,
          features: subscription.features || [],
        };
      }

      return this.getDefaultSubscription();
    } catch (error) {
      console.warn(
        "Error in getUserSubscription:",
        error instanceof Error ? error.message : "Unknown error",
      );
      return this.getDefaultSubscription();
    }
  }

  private async getUserSubscriptionFallback(userId: string) {
    try {
      // Try to query user_subscriptions table directly
      const { data: subscription, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (error || !subscription) {
        console.warn("No active subscription found, using default");
        return this.getDefaultSubscription();
      }

      // Get current month usage
      const currentUsage = await this.getMonthlyUsage();

      return {
        plan_name: subscription.plan_name || "Free",
        plan_id: subscription.plan_id || "free",
        transformation_limit: subscription.transformation_limit || 25,
        current_usage: currentUsage,
        remaining_transformations: Math.max(
          0,
          (subscription.transformation_limit || 25) - currentUsage,
        ),
        status: subscription.status || "active",
        period_end: subscription.period_end,
        billing_cycle: subscription.billing_cycle || "monthly",
        can_transform: currentUsage < (subscription.transformation_limit || 25),
        features: subscription.features || [
          "Basic code analysis",
          "Up to 25 transformations/month",
          "Community support",
        ],
      };
    } catch (error) {
      console.warn(
        "Fallback subscription query failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
      return this.getDefaultSubscription();
    }
  }

  private getDefaultSubscription() {
    return {
      plan_name: "Free",
      plan_id: "free",
      transformation_limit: 25,
      current_usage: 0,
      remaining_transformations: 25,
      status: "active",
      period_end: null,
      billing_cycle: "monthly",
      can_transform: true,
      features: [
        "Basic code analysis",
        "Up to 25 transformations/month",
        "Community support",
      ],
    };
  }

  async getMonthlyUsage(): Promise<number> {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        return 0;
      }

      const { data, error } = await supabase.rpc("get_monthly_usage", {
        user_uuid: user.user.id,
      });

      if (error) {
        console.error("Error fetching monthly usage:", error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error("Error in getMonthlyUsage:", error);
      return 0;
    }
  }
}

export const paypalService = new PayPalService();
