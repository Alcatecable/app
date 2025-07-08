
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paypalService, PayPalSubscriptionPlan } from '@/lib/paypal/paypal-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Check, 
  Zap, 
  Users, 
  Building, 
  ArrowRight,
  CreditCard,
  Calendar
} from 'lucide-react';

interface UserSubscription {
  plan_name: string;
  plan_id: string;
  transformation_limit: number;
  current_usage: number;
  remaining_transformations: number;
  status: string;
  period_end: string | null;
  billing_cycle: string;
  can_transform: boolean;
  features: string[];
}

export function SubscriptionManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PayPalSubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [plansData] = await Promise.all([
        paypalService.getSubscriptionPlans()
      ]);
      
      setPlans(plansData);
      
      // Set mock user subscription data that matches the interface
      setUserSubscription({
        plan_name: 'Free',
        plan_id: 'free',
        transformation_limit: 25,
        current_usage: 5,
        remaining_transformations: 20,
        status: 'active',
        period_end: null,
        billing_cycle: 'monthly',
        can_transform: true,
        features: ['Basic code analysis', 'Up to 25 transformations/month', 'Community support']
      });
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    if (!user) return;

    setProcessingPlanId(planId);
    try {
      const response = await paypalService.createSubscription({
        planId,
        billingCycle,
        returnUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancel`
      });

      // Open PayPal approval URL in new tab
      window.open(response.approvalUrl, '_blank');

      toast({
        title: "Redirecting to PayPal",
        description: "Complete your subscription in the new tab"
      });
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPlanId(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'pro': return <Zap className="h-6 w-6" />;
      case 'team': return <Users className="h-6 w-6" />;
      case 'enterprise': return <Building className="h-6 w-6" />;
      default: return <Crown className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'pro': return 'border-blue-200 bg-blue-50';
      case 'team': return 'border-purple-200 bg-purple-50';
      case 'enterprise': return 'border-orange-200 bg-orange-50';
      default: return 'border-green-200 bg-green-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const usagePercentage = userSubscription 
    ? (userSubscription.current_usage / userSubscription.transformation_limit) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {userSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {userSubscription.plan_name}
                </Badge>
                <Badge variant={userSubscription.status === 'active' ? 'default' : 'secondary'}>
                  {userSubscription.status}
                </Badge>
              </div>
              {userSubscription.period_end && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Renews {new Date(userSubscription.period_end).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Usage</span>
                <span className="font-medium">
                  {userSubscription.current_usage} / {userSubscription.transformation_limit}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {userSubscription.remaining_transformations} transformations remaining
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = userSubscription?.plan_name === plan.name;
          const isFree = plan.name === 'Free';
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${getPlanColor(plan.name)} ${
                isCurrentPlan ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.name}
                  {isCurrentPlan && <Badge variant="secondary">Current</Badge>}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="py-4">
                  {isFree ? (
                    <div className="text-3xl font-bold">Free</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        ${plan.price_monthly}
                        <span className="text-lg font-normal text-muted-foreground">/mo</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        or ${plan.price_yearly}/yr (save {Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)}%)
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold">{plan.transformation_limit.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">transformations/month</div>
                </div>

                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isFree && !isCurrentPlan && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleSubscribe(plan.id, 'monthly')}
                      disabled={processingPlanId === plan.id}
                      className="w-full"
                    >
                      {processingPlanId === plan.id ? (
                        'Processing...'
                      ) : (
                        <>
                          Subscribe Monthly
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleSubscribe(plan.id, 'yearly')}
                      disabled={processingPlanId === plan.id}
                      variant="outline"
                      className="w-full"
                    >
                      Subscribe Yearly (Save {Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)}%)
                    </Button>
                  </div>
                )}

                {isCurrentPlan && !isFree && (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
