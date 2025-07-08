
-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  transformation_limit INTEGER NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  paypal_plan_id_monthly TEXT,
  paypal_plan_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert subscription plans based on market research for developer tools
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, transformation_limit, features, paypal_plan_id_monthly, paypal_plan_id_yearly) VALUES
('Free', 'Perfect for trying out NeuroLint', 0.00, 0.00, 25, '["Basic code analysis", "Up to 25 transformations/month", "Community support", "Standard processing speed"]'::jsonb, NULL, NULL),
('Pro', 'For individual developers and freelancers', 19.99, 199.99, 500, '["Advanced code analysis", "Up to 500 transformations/month", "Priority support", "Custom rules", "Export reports", "Faster processing", "API access"]'::jsonb, 'P-PRO-MONTHLY', 'P-PRO-YEARLY'),
('Team', 'For small to medium development teams', 49.99, 499.99, 2000, '["Everything in Pro", "Up to 2000 transformations/month", "Team collaboration", "Advanced analytics", "Bulk processing", "Team management", "Integration webhooks"]'::jsonb, 'P-TEAM-MONTHLY', 'P-TEAM-YEARLY'),
('Enterprise', 'For large organizations with custom needs', 149.99, 1499.99, 10000, '["Everything in Team", "Up to 10000 transformations/month", "Dedicated support", "Custom integrations", "On-premise deployment", "SLA guarantee", "White-label options", "Custom rules engine"]'::jsonb, 'P-ENT-MONTHLY', 'P-ENT-YEARLY');

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  paypal_subscription_id TEXT,
  paypal_plan_id TEXT,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired', 'past_due', 'suspended')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create PayPal payments tracking table
CREATE TABLE IF NOT EXISTS public.paypal_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  paypal_payment_id TEXT NOT NULL,
  paypal_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  payment_type TEXT DEFAULT 'subscription' CHECK (payment_type IN ('subscription', 'one_time', 'upgrade')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paypal_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans (publicly readable)
CREATE POLICY "Anyone can view active subscription plans" 
  ON public.subscription_plans 
  FOR SELECT 
  TO authenticated, anon
  USING (is_active = true);

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for paypal_payments
CREATE POLICY "Users can view their own payments" 
  ON public.paypal_payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" 
  ON public.paypal_payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update transformations table for better usage tracking
ALTER TABLE public.transformations 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.user_subscriptions(id),
ADD COLUMN IF NOT EXISTS billing_period_start DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS processing_priority INTEGER DEFAULT 3;

-- Update profiles table to link with subscriptions
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_subscription_id UUID REFERENCES public.user_subscriptions(id),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';

-- Create function to get user's current monthly usage
CREATE OR REPLACE FUNCTION public.get_monthly_usage(user_uuid UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(COUNT(*), 0)::INTEGER
  FROM public.transformations 
  WHERE user_id = user_uuid 
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND success = true;
$$;

-- Create function to get user's subscription details with limits
CREATE OR REPLACE FUNCTION public.get_user_subscription_details(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  plan_name TEXT,
  plan_id UUID,
  transformation_limit INTEGER,
  current_usage INTEGER,
  remaining_transformations INTEGER,
  status TEXT,
  period_end TIMESTAMP WITH TIME ZONE,
  billing_cycle TEXT,
  can_transform BOOLEAN,
  features JSONB
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  WITH user_sub AS (
    SELECT 
      us.id,
      us.plan_id,
      us.status,
      us.current_period_end,
      us.billing_cycle,
      sp.name,
      sp.transformation_limit,
      sp.features,
      public.get_monthly_usage(user_uuid) as current_usage
    FROM public.profiles p
    LEFT JOIN public.user_subscriptions us ON p.id = us.user_id AND us.status IN ('active', 'trialing')
    LEFT JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE p.id = user_uuid
  )
  SELECT 
    COALESCE(us.name, 'Free') as plan_name,
    us.plan_id,
    COALESCE(us.transformation_limit, 25) as transformation_limit,
    COALESCE(us.current_usage, 0) as current_usage,
    GREATEST(0, COALESCE(us.transformation_limit, 25) - COALESCE(us.current_usage, 0)) as remaining_transformations,
    COALESCE(us.status, 'free') as status,
    us.current_period_end as period_end,
    us.billing_cycle,
    (COALESCE(us.current_usage, 0) < COALESCE(us.transformation_limit, 25)) as can_transform,
    COALESCE(us.features, '["Basic code analysis", "Up to 25 transformations/month", "Community support"]'::jsonb) as features
  FROM user_sub us;
$$;

-- Create function to check if user can perform transformation
CREATE OR REPLACE FUNCTION public.can_user_transform(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT can_transform 
  FROM public.get_user_subscription_details(user_uuid);
$$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id 
  FROM public.subscription_plans 
  WHERE name = 'Free' AND is_active = true 
  LIMIT 1;

  -- Insert user profile
  INSERT INTO public.profiles (id, email, full_name, plan_type, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'free',
    'free'
  );

  -- Create free subscription for new user
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (
      user_id, 
      plan_id, 
      status, 
      current_period_start, 
      current_period_end
    ) VALUES (
      NEW.id,
      free_plan_id,
      'active',
      NOW(),
      NOW() + INTERVAL '1 month'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update subscription status in profiles
CREATE OR REPLACE FUNCTION public.update_profile_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    current_subscription_id = NEW.id,
    subscription_status = NEW.status,
    plan_type = (SELECT name FROM public.subscription_plans WHERE id = NEW.plan_id)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_subscription_status();
