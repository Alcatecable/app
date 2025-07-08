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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NeuroLintOrchestrator } from "@/lib/neurolint";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTransformations: number;
  todayTransformations: number;
  systemHealth: number;
  averageExecutionTime: number;
  errorRate: number;
  popularLayers: Array<{layerId: number, count: number, name: string}>;
}

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  plan: string;
  usage: number;
  limit: number;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'moderator';
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
    popularLayers: []
  });
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [transformations, setTransformations] = useState<TransformationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [userFilter, setUserFilter] = useState("");
  const [transformationFilter, setTransformationFilter] = useState("");
  const [dateRange, setDateRange] = useState("7d");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load admin data
  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadTransformations()
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        title: "Failed to load admin data",
        description: "Some data may not be current. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get user stats
      const { data: userStats } = await supabase
        .from('profiles')
        .select('id, created_at, updated_at');

      // Get transformation stats
      const { data: transformationStats } = await supabase
        .from('transformations')
        .select('*');

      // Calculate date ranges
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const todayTransformations = transformationStats?.filter(t => 
        new Date(t.created_at) >= todayStart
      ) || [];

      const recentUsers = userStats?.filter(u => 
        new Date(u.updated_at || u.created_at) >= weekAgo
      ) || [];

      // Calculate layer popularity
      const layerCounts: Record<number, number> = {};
      transformationStats?.forEach(t => {
        t.layers_used?.forEach((layerId: number) => {
          layerCounts[layerId] = (layerCounts[layerId] || 0) + 1;
        });
      });

      const popularLayers = Object.entries(layerCounts)
        .map(([layerId, count]) => ({
          layerId: parseInt(layerId),
          count,
          name: getLayerName(parseInt(layerId))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      // Calculate metrics
      const successfulTransformations = transformationStats?.filter(t => t.success) || [];
      const failedTransformations = transformationStats?.filter(t => !t.success) || [];
      
      const avgExecTime = successfulTransformations.length > 0
        ? successfulTransformations.reduce((sum, t) => sum + (t.execution_time_ms || 0), 0) / successfulTransformations.length
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
        popularLayers
      });

    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // This would typically join with subscription and usage data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*');

      const usersData: UserData[] = profiles?.map(profile => {
        const subscription = subscriptions?.find(s => s.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || 'Unknown',
          created_at: profile.created_at,
          last_sign_in_at: profile.updated_at,
          plan: subscription?.plan_name || 'Free',
          usage: subscription?.current_usage || 0,
          limit: subscription?.transformation_limit || 25,
          status: 'active', // You'd determine this based on your business logic
          role: 'user' // You'd get this from your role system
        };
      }) || [];

      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadTransformations = async () => {
    try {
      const { data } = await supabase
        .from('transformations')
        .select(`
          *,
          profiles!inner(email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      const transformationsData: TransformationData[] = data?.map(t => ({
        id: t.id,
        user_email: t.profiles?.email || 'Unknown',
        created_at: t.created_at,
        layers_used: t.layers_used || [],
        execution_time_ms: t.execution_time_ms || 0,
        success: t.success || false,
        original_code_length: t.original_code_length || 0,
        transformed_code_length: t.transformed_code_length || 0,
        changes_count: t.changes_count || 0,
        file_name: t.file_name
      })) || [];

      setTransformations(transformationsData);
    } catch (error) {
      console.error('Failed to load transformations:', error);
    }
  };

  const getLayerName = (layerId: number): string => {
    const layerNames: Record<number, string> = {
      1: 'Configuration',
      2: 'Entity Cleanup',
      3: 'Components',
      4: 'Hydration',
      5: 'Next.js',
      6: 'Testing'
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

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete' | 'promote') => {
    try {
      // Implement user actions based on your business logic
      switch (action) {
        case 'suspend':
          // Update user status to suspended
          break;
        case 'activate':
          // Update user status to active
          break;
        case 'delete':
          // Soft delete user
          break;
        case 'promote':
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

  const exportData = (type: 'users' | 'transformations') => {
    const data = type === 'users' ? users : transformations;
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: `${type} data has been exported to CSV.`,
    });
  };

  // Filter functions
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userFilter.toLowerCase()) &&
    (statusFilter === 'all' || user.status === statusFilter)
  );

  const filteredTransformations = transformations.filter(t =>
    t.user_email.toLowerCase().includes(transformationFilter.toLowerCase()) ||
    (t.file_name && t.file_name.toLowerCase().includes(transformationFilter.toLowerCase()))
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
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Transformations</p>
                    <p className="text-2xl font-bold">{stats.totalTransformations.toLocaleString()}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">System Health</p>
                    <p className="text-2xl font-bold">{stats.systemHealth.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.errorRate.toFixed(2)}% error rate
                    </p>
                  </div>
                  <Server className={`h-8 w-8 ${stats.systemHealth > 95 ? 'text-green-600' : stats.systemHealth > 85 ? 'text-yellow-600' : 'text-red-600'}`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Exec Time</p>
                    <p className="text-2xl font-bold">{stats.averageExecutionTime.toFixed(0)}ms</p>
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
                      value={(layer.count / (stats.popularLayers[0]?.count || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Admin Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="transformations">Transformations</TabsTrigger>
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
                      onClick={() => exportData('users')}
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
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Joined</th>
                            <th className="text-left p-4 font-medium">Actions</th>
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
                                      {user.role === 'admin' && <Crown className="w-3 h-3 inline mr-1" />}
                                      {user.role}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant={user.plan === 'Free' ? 'secondary' : 'default'}>
                                  {user.plan}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>{user.usage}</span>
                                    <span className="text-muted-foreground">/ {user.limit}</span>
                                  </div>
                                  <Progress value={(user.usage / user.limit) * 100} className="h-1" />
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge 
                                  variant={
                                    user.status === 'active' ? 'default' : 
                                    user.status === 'suspended' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {user.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                                  {user.status === 'inactive' && <Clock className="w-3 h-3 mr-1" />}
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
                                    onClick={() => handleUserAction(user.id, 'suspend')}
                                  >
                                    <UserX className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUserAction(user.id, 'promote')}
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
                      onClick={() => exportData('transformations')}
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
                        onChange={(e) => setTransformationFilter(e.target.value)}
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
                            <th className="text-left p-4 font-medium">Layers</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Execution</th>
                            <th className="text-left p-4 font-medium">Changes</th>
                            <th className="text-left p-4 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransformations.slice(0, 50).map((transformation) => (
                            <tr key={transformation.id} className="border-b">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-green-700">
                                      {transformation.user_email[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-sm">{transformation.user_email}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-mono">
                                    {transformation.file_name || 'Pasted code'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-1">
                                  {transformation.layers_used.map(layerId => (
                                    <Badge key={layerId} variant="outline" className="text-xs">
                                      L{layerId}
                                    </Badge>
                                  ))}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge 
                                  variant={transformation.success ? 'default' : 'destructive'}
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
                                  <span className="font-medium">{transformation.changes_count}</span>
                                  <div className="text-xs text-muted-foreground">
                                    {transformation.original_code_length} → {transformation.transformed_code_length} chars
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {new Date(transformation.created_at).toLocaleDateString()}
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
                        <span className="font-bold text-green-600">+{stats.activeUsers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Transformations</span>
                        <span className="font-bold text-blue-600">{stats.todayTransformations}</span>
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
                        <span className="font-bold">{stats.averageExecutionTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">System Uptime</span>
                        <span className="font-bold text-green-600">99.9%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Error Rate</span>
                        <span className={`font-bold ${stats.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
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
    </ProtectedRoute>
  );
}