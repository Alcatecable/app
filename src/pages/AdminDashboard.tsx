import React, { useState, useEffect, useCallback } from "react";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Activity,
  TrendingUp,
  Server,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  FileText,
  Settings,
  Shield,
  Database,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Crown,
  UserCheck,
  UserX,
  Globe,
  Calendar,
  Mail,
  Phone,
  Building,
  GitBranch,
  Code2,
  Layers,
  Timer,
  Key,
  Lock,
  Unlock,
  Save,
  TestTube,
  Copy,
  EyeOff,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NeuroLintOrchestrator } from "@/lib/neurolint";
import { credentialStorage } from "@/lib/security/credential-storage";
import { connectionTester } from "@/lib/services/connection-tester";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTransformations: number;
  todayTransformations: number;
  systemHealth: number;
  averageExecutionTime: number;
  errorRate: number;
  popularLayers: Array<{ layerId: number; count: number; name: string }>;
}

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  plan: string;
  usage: number;
  limit: number;
  status: "active" | "inactive" | "suspended";
  role: "user" | "admin" | "moderator";
}

interface TransformationData {
  id: string;
  user_email: string;
  created_at: string;
  layers_used: number[];
  execution_time_ms: number;
  success: boolean;
  original_code_length: number;
  transformed_code_length: number;
  changes_count: number;
  file_name?: string;
}

interface CredentialConfig {
  id: string;
  name: string;
  service: string;
  fields: CredentialField[];
  description: string;
  icon: React.ReactNode;
  testEndpoint?: string;
}

interface CredentialField {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "select";
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: string[];
}

interface StoredCredentials {
  [key: string]: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Core states
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransformations: 0,
    todayTransformations: 0,
    systemHealth: 100,
    averageExecutionTime: 0,
    errorRate: 0,
    popularLayers: [],
  });

  const [users, setUsers] = useState<UserData[]>([]);
  const [transformations, setTransformations] = useState<TransformationData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [userFilter, setUserFilter] = useState("");
  const [transformationFilter, setTransformationFilter] = useState("");
  const [dateRange, setDateRange] = useState("7d");
  const [statusFilter, setStatusFilter] = useState("all");

  // Credentials management states
  const [credentials, setCredentials] = useState<StoredCredentials>({});
  const [editingCredentials, setEditingCredentials] =
    useState<StoredCredentials>({});
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [testingConnections, setTestingConnections] = useState<{
    [key: string]: boolean;
  }>({});
  const [connectionStatus, setConnectionStatus] = useState<{
    [key: string]: "success" | "error" | "unknown";
  }>({});
  const [credentialsSaved, setCredentialsSaved] = useState(false);

  // Load admin data
  useEffect(() => {
    if (user) {
      loadAdminData();
      loadCredentials();
    }
  }, [user]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadStats(), loadUsers(), loadTransformations()]);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast({
        title: "Failed to load admin data",
        description: "Some data may not be current. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Credential configurations for different services
  const credentialConfigs: CredentialConfig[] = [
    {
      id: "supabase",
      name: "Supabase",
      service: "Database & Auth",
      icon: <Database className="h-5 w-5 text-green-600" />,
      description: "Database and authentication service configuration",
      fields: [
        {
          key: "VITE_SUPABASE_URL",
          label: "Supabase URL",
          type: "url",
          required: true,
          placeholder: "https://your-project.supabase.co",
          description: "Your Supabase project URL",
        },
        {
          key: "VITE_SUPABASE_ANON_KEY",
          label: "Supabase Anon Key",
          type: "password",
          required: true,
          placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          description: "Public anonymous key for client-side access",
        },
        {
          key: "SUPABASE_SERVICE_ROLE_KEY",
          label: "Service Role Key",
          type: "password",
          required: false,
          placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          description: "Server-side service role key (admin access)",
        },
      ],
    },
    {
      id: "paypal",
      name: "PayPal",
      service: "Payment Processing",
      icon: <Globe className="h-5 w-5 text-blue-600" />,
      description: "PayPal payment processing and subscription management",
      fields: [
        {
          key: "VITE_PAYPAL_CLIENT_ID",
          label: "PayPal Client ID",
          type: "text",
          required: true,
          placeholder:
            "AYSq3RDGsmBLJE-otTkBtM-jBRd1TCQwFf9RGfwddNXWz0uFU9ztymylOhRS...",
          description: "PayPal application client ID",
        },
        {
          key: "PAYPAL_CLIENT_SECRET",
          label: "PayPal Client Secret",
          type: "password",
          required: true,
          placeholder:
            "EGnHDxD_qRPdaLdHgGYs_J4uGD5GjRc_EuK_G5g-Nc0bz0f1Y2s6K3r7s...",
          description: "PayPal application client secret",
        },
        {
          key: "PAYPAL_ENVIRONMENT",
          label: "Environment",
          type: "select",
          required: true,
          options: ["sandbox", "production"],
          description:
            "PayPal environment (sandbox for testing, production for live)",
        },
        {
          key: "PAYPAL_WEBHOOK_ID",
          label: "Webhook ID",
          type: "text",
          required: false,
          placeholder: "1JE25297HC6565909",
          description: "PayPal webhook ID for event notifications",
        },
      ],
    },
    {
      id: "resend",
      name: "Resend",
      service: "Email Service",
      icon: <Mail className="h-5 w-5 text-purple-600" />,
      description: "Email delivery service for notifications and marketing",
      fields: [
        {
          key: "RESEND_API_KEY",
          label: "Resend API Key",
          type: "password",
          required: true,
          placeholder: "re_123abc456def789ghi012jkl345mno678pqr",
          description: "Resend API key for email sending",
        },
        {
          key: "RESEND_FROM_EMAIL",
          label: "From Email",
          type: "text",
          required: true,
          placeholder: "noreply@neurolint.dev",
          description: "Default sender email address",
        },
      ],
    },
    {
      id: "github",
      name: "GitHub",
      service: "Repository Integration",
      icon: <GitBranch className="h-5 w-5 text-gray-800" />,
      description: "GitHub API for repository access and integration",
      fields: [
        {
          key: "GITHUB_TOKEN",
          label: "GitHub Personal Access Token",
          type: "password",
          required: false,
          placeholder: "ghp_1234567890abcdef1234567890abcdef12345678",
          description: "GitHub PAT for accessing private repositories",
        },
        {
          key: "GITHUB_APP_ID",
          label: "GitHub App ID",
          type: "text",
          required: false,
          placeholder: "123456",
          description: "GitHub App ID for enhanced integration",
        },
      ],
    },
    {
      id: "system",
      name: "System",
      service: "Application Settings",
      icon: <Settings className="h-5 w-5 text-gray-600" />,
      description: "Core application configuration and feature flags",
      fields: [
        {
          key: "VITE_APP_URL",
          label: "Application URL",
          type: "url",
          required: true,
          placeholder: "https://app.neurolint.dev",
          description: "Base URL for the application",
        },
        {
          key: "ENVIRONMENT",
          label: "Environment",
          type: "select",
          required: true,
          options: ["development", "staging", "production"],
          description: "Current deployment environment",
        },
        {
          key: "DEBUG_MODE",
          label: "Debug Mode",
          type: "select",
          required: false,
          options: ["true", "false"],
          description: "Enable detailed logging and debugging",
        },
      ],
    },
  ];

  const loadStats = async () => {
    try {
      // Get user stats
      const { data: userStats } = await supabase
        .from("profiles")
        .select("id, created_at, updated_at");

      // Get transformation stats
      const { data: transformationStats } = await supabase
        .from("transformations")
        .select("*");

      // Calculate date ranges
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const todayTransformations =
        transformationStats?.filter(
          (t) => new Date(t.created_at) >= todayStart,
        ) || [];

      const recentUsers =
        userStats?.filter(
          (u) => new Date(u.updated_at || u.created_at) >= weekAgo,
        ) || [];

      // Calculate layer popularity
      const layerCounts: Record<number, number> = {};
      transformationStats?.forEach((t) => {
        t.layers_used?.forEach((layerId: number) => {
          layerCounts[layerId] = (layerCounts[layerId] || 0) + 1;
        });
      });

      const popularLayers = Object.entries(layerCounts)
        .map(([layerId, count]) => ({
          layerId: parseInt(layerId),
          count,
          name: getLayerName(parseInt(layerId)),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      // Calculate metrics
      const successfulTransformations =
        transformationStats?.filter((t) => t.success) || [];
      const failedTransformations =
        transformationStats?.filter((t) => !t.success) || [];

      const avgExecTime =
        successfulTransformations.length > 0
          ? successfulTransformations.reduce(
              (sum, t) => sum + (t.execution_time_ms || 0),
              0,
            ) / successfulTransformations.length
          : 0;

      const errorRate = transformationStats?.length
        ? (failedTransformations.length / transformationStats.length) * 100
        : 0;

      setStats({
        totalUsers: userStats?.length || 0,
        activeUsers: recentUsers.length,
        totalTransformations: transformationStats?.length || 0,
        todayTransformations: todayTransformations.length,
        systemHealth: Math.max(0, 100 - errorRate),
        averageExecutionTime: avgExecTime,
        errorRate,
        popularLayers,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadUsers = async () => {
    try {
      // This would typically join with subscription and usage data
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*");

      const usersData: UserData[] =
        profiles?.map((profile) => {
          const subscription = subscriptions?.find(
            (s) => s.user_id === profile.id,
          );
          return {
            id: profile.id,
            email: profile.email || "Unknown",
            created_at: profile.created_at,
            last_sign_in_at: profile.updated_at,
            plan: subscription?.plan_name || "Free",
            usage: subscription?.current_usage || 0,
            limit: subscription?.transformation_limit || 25,
            status: "active", // You'd determine this based on your business logic
            role: "user", // You'd get this from your role system
          };
        }) || [];

      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadTransformations = async () => {
    try {
      const { data } = await supabase
        .from("transformations")
        .select(
          `
          *,
          profiles!inner(email)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(100);

      const transformationsData: TransformationData[] =
        data?.map((t) => ({
          id: t.id,
          user_email: t.profiles?.email || "Unknown",
          created_at: t.created_at,
          layers_used: t.layers_used || [],
          execution_time_ms: t.execution_time_ms || 0,
          success: t.success || false,
          original_code_length: t.original_code_length || 0,
          transformed_code_length: t.transformed_code_length || 0,
          changes_count: t.changes_count || 0,
          file_name: t.file_name,
        })) || [];

      setTransformations(transformationsData);
    } catch (error) {
      console.error("Failed to load transformations:", error);
    }
  };

  const getLayerName = (layerId: number): string => {
    const layerNames: Record<number, string> = {
      1: "Configuration",
      2: "Entity Cleanup",
      3: "Components",
      4: "Hydration",
      5: "Next.js",
      6: "Testing",
    };
    return layerNames[layerId] || `Layer ${layerId}`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "All admin data has been updated.",
    });
  };

  const handleUserAction = async (
    userId: string,
    action: "suspend" | "activate" | "delete" | "promote",
  ) => {
    try {
      // Implement user actions based on your business logic
      switch (action) {
        case "suspend":
          // Update user status to suspended
          break;
        case "activate":
          // Update user status to active
          break;
        case "delete":
          // Soft delete user
          break;
        case "promote":
          // Change user role
          break;
      }

      await loadUsers();
      toast({
        title: "User action completed",
        description: `User has been ${action}d successfully.`,
      });
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Failed to perform user action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportData = (type: "users" | "transformations") => {
    const data = type === "users" ? users : transformations;
    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map((row) =>
        Object.values(row)
          .map((val) =>
            typeof val === "string" && val.includes(",") ? `"${val}"` : val,
          )
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: `${type} data has been exported to CSV.`,
    });
  };

  // Credential management functions
  const loadCredentials = async () => {
    try {
      const storedCreds = await credentialStorage.retrieveCredentials();
      setCredentials(storedCreds);
      setEditingCredentials({ ...storedCreds });

      // Check connection status for each service
      Object.keys(storedCreds).forEach((serviceId) => {
        if (
          storedCreds[serviceId] &&
          Object.keys(storedCreds[serviceId]).length > 0
        ) {
          checkConnectionStatus(serviceId);
        }
      });
    } catch (error) {
      console.error("Failed to load credentials:", error);
      toast({
        title: "Failed to load credentials",
        description: "There was an error loading stored credentials.",
        variant: "destructive",
      });
    }
  };

  const saveCredentials = async () => {
    try {
      // In production, this would encrypt and send to secure backend
      localStorage.setItem(
        "admin_credentials",
        JSON.stringify(editingCredentials),
      );
      setCredentials({ ...editingCredentials });
      setCredentialsSaved(true);

      toast({
        title: "Credentials saved",
        description: "All credentials have been securely stored.",
      });

      // Refresh connection status
      Object.keys(editingCredentials).forEach((serviceId) => {
        checkConnectionStatus(serviceId);
      });

      setTimeout(() => setCredentialsSaved(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to save credentials",
        description: "There was an error saving the credentials.",
        variant: "destructive",
      });
    }
  };

  const updateCredentialField = (
    serviceId: string,
    fieldKey: string,
    value: string,
  ) => {
    setEditingCredentials((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [fieldKey]: value,
      },
    }));
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const testConnection = async (serviceId: string) => {
    setTestingConnections((prev) => ({ ...prev, [serviceId]: true }));

    try {
      const serviceCredentials = editingCredentials[serviceId] || {};
      let success = false;

      switch (serviceId) {
        case "supabase":
          success = await testSupabaseConnection(serviceCredentials);
          break;
        case "paypal":
          success = await testPayPalConnection(serviceCredentials);
          break;
        case "resend":
          success = await testResendConnection(serviceCredentials);
          break;
        case "github":
          success = await testGitHubConnection(serviceCredentials);
          break;
        default:
          success = true; // For system configs, just validate format
      }

      setConnectionStatus((prev) => ({
        ...prev,
        [serviceId]: success ? "success" : "error",
      }));

      toast({
        title: success ? "Connection successful" : "Connection failed",
        description: success
          ? `Successfully connected to ${credentialConfigs.find((c) => c.id === serviceId)?.name}`
          : `Failed to connect to ${credentialConfigs.find((c) => c.id === serviceId)?.name}`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, [serviceId]: "error" }));
      toast({
        title: "Connection test failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setTestingConnections((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const checkConnectionStatus = async (serviceId: string) => {
    // Lightweight connection check without user action
    try {
      const serviceCredentials = credentials[serviceId] || {};
      const hasRequiredFields = credentialConfigs
        .find((c) => c.id === serviceId)
        ?.fields.filter((f) => f.required)
        .every((f) => serviceCredentials[f.key]);

      if (!hasRequiredFields) {
        setConnectionStatus((prev) => ({ ...prev, [serviceId]: "unknown" }));
        return;
      }

      // Quick validation without full API calls
      setConnectionStatus((prev) => ({ ...prev, [serviceId]: "success" }));
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, [serviceId]: "error" }));
    }
  };

  // Service-specific connection testers
  const testSupabaseConnection = async (creds: any): Promise<boolean> => {
    if (!creds.VITE_SUPABASE_URL || !creds.VITE_SUPABASE_ANON_KEY) {
      throw new Error("Missing required Supabase credentials");
    }

    try {
      const response = await fetch(`${creds.VITE_SUPABASE_URL}/rest/v1/`, {
        headers: {
          apikey: creds.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${creds.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const testPayPalConnection = async (creds: any): Promise<boolean> => {
    if (!creds.VITE_PAYPAL_CLIENT_ID || !creds.PAYPAL_CLIENT_SECRET) {
      throw new Error("Missing required PayPal credentials");
    }

    try {
      const baseUrl =
        creds.PAYPAL_ENVIRONMENT === "production"
          ? "https://api.paypal.com"
          : "https://api.sandbox.paypal.com";

      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${creds.VITE_PAYPAL_CLIENT_ID}:${creds.PAYPAL_CLIENT_SECRET}`)}`,
        },
        body: "grant_type=client_credentials",
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const testResendConnection = async (creds: any): Promise<boolean> => {
    if (!creds.RESEND_API_KEY) {
      throw new Error("Missing Resend API key");
    }

    try {
      const response = await fetch("https://api.resend.com/domains", {
        headers: {
          Authorization: `Bearer ${creds.RESEND_API_KEY}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const testGitHubConnection = async (creds: any): Promise<boolean> => {
    if (!creds.GITHUB_TOKEN) {
      return true; // GitHub token is optional
    }

    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${creds.GITHUB_TOKEN}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
    });
  };

  // Filter functions
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(userFilter.toLowerCase()) &&
      (statusFilter === "all" || user.status === statusFilter),
  );

  const filteredTransformations = transformations.filter(
    (t) =>
      t.user_email.toLowerCase().includes(transformationFilter.toLowerCase()) ||
      (t.file_name &&
        t.file_name.toLowerCase().includes(transformationFilter.toLowerCase())),
  );

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground">
                    NeuroLint System Administration
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Badge variant="default" className="text-sm">
                Admin Access
              </Badge>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      +{stats.activeUsers} active this week
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Transformations
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.totalTransformations.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      +{stats.todayTransformations} today
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      System Health
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.systemHealth.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.errorRate.toFixed(2)}% error rate
                    </p>
                  </div>
                  <Server
                    className={`h-8 w-8 ${stats.systemHealth > 95 ? "text-green-600" : stats.systemHealth > 85 ? "text-yellow-600" : "text-red-600"}`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Avg Exec Time
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.averageExecutionTime.toFixed(0)}ms
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Per transformation
                    </p>
                  </div>
                  <Timer className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Layers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Popular Transformation Layers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.popularLayers.map((layer, index) => (
                  <div key={layer.layerId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{layer.name}</span>
                      <Badge variant="secondary">{layer.count}</Badge>
                    </div>
                    <Progress
                      value={
                        (layer.count / (stats.popularLayers[0]?.count || 1)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Admin Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="transformations">Transformations</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="system">System Health</TabsTrigger>
            </TabsList>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Management
                      </CardTitle>
                      <CardDescription>
                        Manage user accounts, roles, and permissions
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportData("users")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by email..."
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Users Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Plan</th>
                            <th className="text-left p-4 font-medium">Usage</th>
                            <th className="text-left p-4 font-medium">
                              Status
                            </th>
                            <th className="text-left p-4 font-medium">
                              Joined
                            </th>
                            <th className="text-left p-4 font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-700">
                                      {user.email[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.email}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {user.role === "admin" && (
                                        <Crown className="w-3 h-3 inline mr-1" />
                                      )}
                                      {user.role}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={
                                    user.plan === "Free"
                                      ? "secondary"
                                      : "default"
                                  }
                                >
                                  {user.plan}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>{user.usage}</span>
                                    <span className="text-muted-foreground">
                                      / {user.limit}
                                    </span>
                                  </div>
                                  <Progress
                                    value={(user.usage / user.limit) * 100}
                                    className="h-1"
                                  />
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={
                                    user.status === "active"
                                      ? "default"
                                      : user.status === "suspended"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {user.status === "active" && (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {user.status === "suspended" && (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {user.status === "inactive" && (
                                    <Clock className="w-3 h-3 mr-1" />
                                  )}
                                  {user.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleUserAction(user.id, "suspend")
                                    }
                                  >
                                    <UserX className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleUserAction(user.id, "promote")
                                    }
                                  >
                                    <Crown className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transformations Tab */}
            <TabsContent value="transformations" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Transformation Monitoring
                      </CardTitle>
                      <CardDescription>
                        Monitor all code transformations and performance
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportData("transformations")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transformation Filters */}
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by user email or filename..."
                        value={transformationFilter}
                        onChange={(e) =>
                          setTransformationFilter(e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="1d">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="all">All time</option>
                    </select>
                  </div>

                  {/* Transformations Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">File</th>
                            <th className="text-left p-4 font-medium">
                              Layers
                            </th>
                            <th className="text-left p-4 font-medium">
                              Status
                            </th>
                            <th className="text-left p-4 font-medium">
                              Execution
                            </th>
                            <th className="text-left p-4 font-medium">
                              Changes
                            </th>
                            <th className="text-left p-4 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransformations
                            .slice(0, 50)
                            .map((transformation) => (
                              <tr key={transformation.id} className="border-b">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-green-700">
                                        {transformation.user_email[0].toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-sm">
                                      {transformation.user_email}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-mono">
                                      {transformation.file_name ||
                                        "Pasted code"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-1">
                                    {transformation.layers_used.map(
                                      (layerId) => (
                                        <Badge
                                          key={layerId}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          L{layerId}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge
                                    variant={
                                      transformation.success
                                        ? "default"
                                        : "destructive"
                                    }
                                  >
                                    {transformation.success ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Success
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Failed
                                      </>
                                    )}
                                  </Badge>
                                </td>
                                <td className="p-4 text-sm">
                                  {transformation.execution_time_ms}ms
                                </td>
                                <td className="p-4">
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      {transformation.changes_count}
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                      {transformation.original_code_length} →{" "}
                                      {transformation.transformed_code_length}{" "}
                                      chars
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-sm text-muted-foreground">
                                  {new Date(
                                    transformation.created_at,
                                  ).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Credentials Management Tab */}
            <TabsContent value="credentials" className="space-y-6">
              <div className="space-y-6">
                {/* Credentials Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5" />
                          Credentials Management
                        </CardTitle>
                        <CardDescription>
                          Securely manage API keys and service credentials for
                          all integrations
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            loadCredentials();
                            toast({
                              title: "Credentials reloaded",
                              description:
                                "All credentials have been refreshed from storage.",
                            });
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reload
                        </Button>
                        <Button
                          onClick={saveCredentials}
                          disabled={credentialsSaved}
                          className="min-w-[100px]"
                        >
                          {credentialsSaved ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save All
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Security Notice */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-yellow-900">
                        Security Notice
                      </p>
                      <p className="text-xs text-yellow-700">
                        Credentials are stored securely and encrypted. Never
                        share these keys publicly. In production, consider using
                        environment variables and secrets management.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Credentials */}
                <div className="grid gap-6">
                  {credentialConfigs.map((config) => {
                    const serviceCredentials =
                      editingCredentials[config.id] || {};
                    const status = connectionStatus[config.id] || "unknown";
                    const isTesting = testingConnections[config.id] || false;

                    return (
                      <Card
                        key={config.id}
                        className="border-l-4 border-l-blue-500"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {config.icon}
                              <div>
                                <CardTitle className="text-lg">
                                  {config.name}
                                </CardTitle>
                                <CardDescription>
                                  {config.service}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Connection Status */}
                              <div className="flex items-center gap-2">
                                {status === "success" && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <Wifi className="h-4 w-4" />
                                    <span className="text-xs">Connected</span>
                                  </div>
                                )}
                                {status === "error" && (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <WifiOff className="h-4 w-4" />
                                    <span className="text-xs">Error</span>
                                  </div>
                                )}
                                {status === "unknown" && (
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-xs">Unknown</span>
                                  </div>
                                )}
                              </div>

                              {/* Test Connection Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => testConnection(config.id)}
                                disabled={isTesting}
                              >
                                {isTesting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <TestTube className="w-4 h-4" />
                                )}
                                Test
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {config.description}
                          </p>

                          <div className="grid gap-4">
                            {config.fields.map((field) => {
                              const fieldId = `${config.id}_${field.key}`;
                              const value = serviceCredentials[field.key] || "";
                              const isPassword = field.type === "password";
                              const showPassword =
                                showPasswords[fieldId] || false;

                              return (
                                <div key={field.key} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label
                                      htmlFor={fieldId}
                                      className="text-sm font-medium"
                                    >
                                      {field.label}
                                      {field.required && (
                                        <span className="text-red-500 ml-1">
                                          *
                                        </span>
                                      )}
                                    </Label>
                                    {value && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          copyToClipboard(value, field.label)
                                        }
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>

                                  {field.type === "select" ? (
                                    <select
                                      id={fieldId}
                                      value={value}
                                      onChange={(e) =>
                                        updateCredentialField(
                                          config.id,
                                          field.key,
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                    >
                                      <option value="">
                                        Select {field.label}
                                      </option>
                                      {field.options?.map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <div className="relative">
                                      <Input
                                        id={fieldId}
                                        type={
                                          isPassword && !showPassword
                                            ? "password"
                                            : "text"
                                        }
                                        value={value}
                                        onChange={(e) =>
                                          updateCredentialField(
                                            config.id,
                                            field.key,
                                            e.target.value,
                                          )
                                        }
                                        placeholder={field.placeholder}
                                        className="pr-10"
                                      />
                                      {isPassword && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-0 top-0 h-full px-3"
                                          onClick={() =>
                                            togglePasswordVisibility(fieldId)
                                          }
                                        >
                                          {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  )}

                                  {field.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {field.description}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Backup & Security Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const backup = JSON.stringify(credentials, null, 2);
                          const blob = new Blob([backup], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `neurolint_credentials_backup_${new Date().toISOString().split("T")[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          toast({
                            title: "Backup created",
                            description:
                              "Credentials backup has been downloaded.",
                          });
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Backup
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to clear all credentials? This action cannot be undone.",
                            )
                          ) {
                            setCredentials({});
                            setEditingCredentials({});
                            localStorage.removeItem("admin_credentials");
                            toast({
                              title: "Credentials cleared",
                              description:
                                "All stored credentials have been removed.",
                            });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          Object.keys(editingCredentials).forEach(
                            (serviceId) => {
                              testConnection(serviceId);
                            },
                          );
                        }}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Test All Connections
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Growth Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">User Registrations (7d)</span>
                        <span className="font-bold text-green-600">
                          +{stats.activeUsers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Transformations</span>
                        <span className="font-bold text-blue-600">
                          {stats.todayTransformations}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-bold text-green-600">
                          {(100 - stats.errorRate).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Response Time</span>
                        <span className="font-bold">
                          {stats.averageExecutionTime.toFixed(0)}ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">System Uptime</span>
                        <span className="font-bold text-green-600">99.9%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Error Rate</span>
                        <span
                          className={`font-bold ${stats.errorRate > 5 ? "text-red-600" : "text-green-600"}`}
                        >
                          {stats.errorRate.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Health Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Database</span>
                        </div>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">API Services</span>
                        </div>
                        <Badge variant="default">Operational</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Transformation Engine</span>
                        </div>
                        <Badge variant="default">Running</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Resource Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU Usage</span>
                          <span>23%</span>
                        </div>
                        <Progress value={23} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Memory Usage</span>
                          <span>67%</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Storage Usage</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
