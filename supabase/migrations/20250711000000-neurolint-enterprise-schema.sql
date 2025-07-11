-- NeuroLint Enterprise Schema Migration
-- Creates all necessary tables for production-ready API

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 1. Pattern Storage (Core Feature)
CREATE TABLE IF NOT EXISTS neurolint_patterns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  layer_id integer NOT NULL UNIQUE CHECK (layer_id >= 1 AND layer_id <= 7),
  patterns jsonb NOT NULL DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_neurolint_patterns_layer_id ON neurolint_patterns(layer_id);
CREATE INDEX IF NOT EXISTS idx_neurolint_patterns_user_id ON neurolint_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_neurolint_patterns_public ON neurolint_patterns(is_public) WHERE is_public = true;

-- 2. API Usage Analytics
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint text NOT NULL,
  method text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  status_code integer NOT NULL,
  execution_time_ms integer NOT NULL,
  request_size_bytes integer DEFAULT 0,
  response_size_bytes integer DEFAULT 0,
  ip_address inet,
  user_agent text,
  error_details jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_status_code ON api_usage_logs(status_code);

-- 3. Distributed Rate Limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id text PRIMARY KEY, -- IP address or user_id
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  window_duration_seconds integer DEFAULT 900, -- 15 minutes
  limit_per_window integer DEFAULT 100,
  is_blocked boolean DEFAULT false,
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON rate_limits(is_blocked) WHERE is_blocked = true;

-- 4. Transformation History (for analytics and debugging)
CREATE TABLE IF NOT EXISTS transformation_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  original_code_hash text NOT NULL,
  final_code_hash text NOT NULL,
  enabled_layers integer[] NOT NULL,
  layer_results jsonb NOT NULL DEFAULT '[]',
  total_execution_time_ms integer NOT NULL,
  successful_layers integer DEFAULT 0,
  failed_layers integer DEFAULT 0,
  code_size_before integer NOT NULL,
  code_size_after integer NOT NULL,
  improvement_score numeric(5,2) DEFAULT 0,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Indexes for transformation analytics
CREATE INDEX IF NOT EXISTS idx_transformation_history_user_id ON transformation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_transformation_history_created_at ON transformation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_transformation_history_layers ON transformation_history USING GIN(enabled_layers);

-- 5. Real-time Pattern Subscriptions
CREATE TABLE IF NOT EXISTS pattern_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  layer_id integer NOT NULL CHECK (layer_id >= 1 AND layer_id <= 7),
  is_active boolean DEFAULT true,
  last_notified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Unique constraint to prevent duplicate subscriptions
CREATE UNIQUE INDEX IF NOT EXISTS idx_pattern_subscriptions_unique 
ON pattern_subscriptions(user_id, layer_id);

-- 6. System Health Metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  instance_id text,
  tags jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index for metrics queries
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_name ON system_health_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_created_at ON system_health_metrics(created_at);

-- 7. User Quotas and Limits
CREATE TABLE IF NOT EXISTS user_quotas (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  monthly_transformations integer DEFAULT 1000,
  used_transformations integer DEFAULT 0,
  quota_reset_date timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_neurolint_patterns_updated_at 
  BEFORE UPDATE ON neurolint_patterns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at 
  BEFORE UPDATE ON rate_limits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_quotas_updated_at 
  BEFORE UPDATE ON user_quotas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE neurolint_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_history ENABLE ROW LEVEL SECURITY;

-- Patterns: Users can only access their own patterns or public ones
CREATE POLICY "Users can view their own patterns" ON neurolint_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public patterns" ON neurolint_patterns
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own patterns" ON neurolint_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns" ON neurolint_patterns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patterns" ON neurolint_patterns
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: Users can only manage their own subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON pattern_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Quotas: Users can view their own quotas
CREATE POLICY "Users can view their own quotas" ON user_quotas
  FOR SELECT USING (auth.uid() = user_id);

-- Transformation history: Users can view their own history
CREATE POLICY "Users can view their own transformation history" ON transformation_history
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for automatic quota management
CREATE OR REPLACE FUNCTION increment_user_transformations(user_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_quotas (user_id, used_transformations)
  VALUES (user_uuid, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    used_transformations = user_quotas.used_transformations + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly quotas
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
  UPDATE user_quotas 
  SET 
    used_transformations = 0,
    quota_reset_date = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  WHERE quota_reset_date <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete API logs older than 90 days
  DELETE FROM api_usage_logs WHERE created_at < now() - interval '90 days';
  
  -- Delete rate limit entries older than 24 hours
  DELETE FROM rate_limits WHERE window_start < now() - interval '24 hours';
  
  -- Delete old system metrics (keep 30 days)
  DELETE FROM system_health_metrics WHERE created_at < now() - interval '30 days';
  
  -- Delete transformation history older than 1 year
  DELETE FROM transformation_history WHERE created_at < now() - interval '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default patterns for each layer
INSERT INTO neurolint_patterns (layer_id, patterns, metadata, is_public) VALUES
(1, '[]', '{"name": "Configuration Fixes", "description": "TypeScript and build configuration improvements"}', true),
(2, '[]', '{"name": "Pattern Recognition", "description": "Code pattern analysis and corrections"}', true),
(3, '[]', '{"name": "Component Enhancement", "description": "React component optimization and accessibility"}', true),
(4, '[]', '{"name": "Hydration & SSR", "description": "Server-side rendering compatibility fixes"}', true),
(5, '[]', '{"name": "Next.js App Router", "description": "Next.js App Router specific optimizations"}', true),
(6, '[]', '{"name": "Testing & Validation", "description": "Error handling and testing improvements"}', true),
(7, '[]', '{"name": "Adaptive Learning", "description": "AI-powered pattern learning and adaptation"}', true)
ON CONFLICT (layer_id) DO NOTHING;

COMMENT ON TABLE neurolint_patterns IS 'Stores learned patterns for each NeuroLint layer';
COMMENT ON TABLE api_usage_logs IS 'Comprehensive API usage analytics and monitoring';
COMMENT ON TABLE rate_limits IS 'Distributed rate limiting across multiple API instances';
COMMENT ON TABLE transformation_history IS 'Historical record of all code transformations';
COMMENT ON TABLE pattern_subscriptions IS 'Real-time pattern update subscriptions';
COMMENT ON TABLE system_health_metrics IS 'System performance and health monitoring';
COMMENT ON TABLE user_quotas IS 'User transformation quotas and usage tracking';
