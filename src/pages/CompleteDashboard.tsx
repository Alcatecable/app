import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Zap,
  User,
  CreditCard,
  Settings,
  LogOut,
  History,
  FolderOpen,
  BarChart3,
  Users,
  FileText,
  GitBranch,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Database,
  Globe,
  Sparkles,
  Bell,
  Moon,
  Sun,
} from "lucide-react";

// Import existing transformation components
import Dashboard from "./Dashboard"; // Your existing transformation interface

interface DashboardData {
  totalTransformations: number;
  successRate: number;
  averageExecutionTime: number;
  layerUsage: { [key: number]: number };
  recentTransformations: Array<{
    id: string;
    fileName: string;
    timestamp: Date;
    status: 'success' | 'failed';
    layersUsed: number[];
    executionTime: number;
  }>;
  quota: {
    used: number;
    total: number;
    renewsAt: Date;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  lastUpdated: Date;
  totalTransformations: number;
}

export default function CompleteDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  // Data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState(3);

  // Mock data - replace with real API calls
  useEffect(() => {
    // Simulate API call for dashboard data
    setDashboardData({
      totalTransformations: 1247,
      successRate: 94.2,
      averageExecutionTime: 2.3,
      layerUsage: { 1: 89, 2: 95, 3: 78, 4: 67, 5: 82, 6: 71 },
      recentTransformations: [
        {
          id: '1',
          fileName: 'components/Button.tsx',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          status: 'success',
          layersUsed: [2, 3, 4],
          executionTime: 1.8
        },
        {
          id: '2',
          fileName: 'pages/Dashboard.js',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          status: 'success',
          layersUsed: [1, 2, 5],
          executionTime: 3.2
        },
        {
          id: '3',
          fileName: 'utils/helpers.ts',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'failed',
          layersUsed: [2, 6],
          executionTime: 0.5
        }
      ],
      quota: {
        used: 247,
        total: 1000,
        renewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      }
    });

    // Simulate projects data
    setProjects([
      {
        id: '1',
        name: 'E-commerce Platform',
        description: 'React/Next.js online store',
        fileCount: 156,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2),
        totalTransformations: 89
      },
      {
        id: '2',
        name: 'Dashboard Admin',
        description: 'TypeScript admin panel',
        fileCount: 73,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24),
        totalTransformations: 34
      }
    ]);
  }, []);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'transform', label: 'Transform', icon: Zap },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'collaboration', label: 'Team', icon: Users },
    { id: 'rules', label: 'AI Rules', icon: Sparkles },
    { id: 'integrations', label: 'Integrations', icon: GitBranch },
  ];

  const bottomSidebarItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.email?.split('@')[0] || 'Developer'}!
          </h1>
          <p className="text-zinc-400 mt-1">
            Here's what's happening with your code transformations today.
          </p>
        </div>
        <Button className="bg-white hover:bg-gray-100 text-black">
          <Zap className="mr-2 h-4 w-4" />
          New Transformation
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Transformations
            </CardTitle>
            <Activity className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dashboardData?.totalTransformations.toLocaleString()}
            </div>
            <p className="text-xs text-green-400 mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Success Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dashboardData?.successRate}%
            </div>
            <Progress 
              value={dashboardData?.successRate} 
              className="mt-2 bg-zinc-800" 
            />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Avg Execution Time
            </CardTitle>
            <Clock className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dashboardData?.averageExecutionTime}s
            </div>
            <p className="text-xs text-green-400 mt-1">
              -0.3s improvement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              API Quota
            </CardTitle>
            <Database className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dashboardData?.quota.used}/{dashboardData?.quota.total}
            </div>
            <Progress 
              value={(dashboardData?.quota.used || 0) / (dashboardData?.quota.total || 1) * 100} 
              className="mt-2 bg-zinc-800" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Layer Usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transformations */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Transformations</CardTitle>
            <CardDescription className="text-zinc-400">
              Your latest code transformation activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recentTransformations.map((transformation) => (
                <div 
                  key={transformation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                >
                  <div className="flex items-center space-x-3">
                    {transformation.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {transformation.fileName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {formatTimeAgo(transformation.timestamp)} • {transformation.executionTime}s
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {transformation.layersUsed.map((layer) => (
                      <Badge 
                        key={layer} 
                        variant="secondary" 
                        className="text-xs bg-zinc-700 text-zinc-300"
                      >
                        L{layer}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Layer Usage Statistics */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Layer Usage</CardTitle>
            <CardDescription className="text-zinc-400">
              How often each transformation layer is used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(dashboardData?.layerUsage || {}).map(([layer, usage]) => (
                <div key={layer} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300">Layer {layer}</span>
                    <span className="text-zinc-400">{usage}%</span>
                  </div>
                  <Progress value={usage} className="bg-zinc-800" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-zinc-400">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="border-zinc-700 text-zinc-300 hover:text-white"
              onClick={() => setActiveTab('transform')}
            >
              <Zap className="mr-2 h-4 w-4" />
              Transform Code
            </Button>
            <Button 
              variant="outline" 
              className="border-zinc-700 text-zinc-300 hover:text-white"
              onClick={() => setActiveTab('projects')}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button 
              variant="outline" 
              className="border-zinc-700 text-zinc-300 hover:text-white"
              onClick={() => setActiveTab('integrations')}
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Connect GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-zinc-400 mt-1">
            Organize your code transformations by project
          </p>
        </div>
        <Button className="bg-white hover:bg-gray-100 text-black">
          <FolderOpen className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white">{project.name}</CardTitle>
              <CardDescription className="text-zinc-400">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Files</span>
                  <span className="text-white">{project.fileCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Transformations</span>
                  <span className="text-white">{project.totalTransformations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Last Updated</span>
                  <span className="text-white">{formatTimeAgo(project.lastUpdated)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, description: string, icon: React.ComponentType<any>) => {
    const Icon = icon;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-zinc-400 mt-1">{description}</p>
        </div>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Coming Soon</h3>
            <p className="text-zinc-400 text-center max-w-md">
              This feature is currently under development. Stay tuned for updates!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'transform':
        return <Dashboard />;
      case 'projects':
        return renderProjects();
      case 'history':
        return renderPlaceholder('Transformation History', 'View and manage your transformation history', History);
      case 'analytics':
        return renderPlaceholder('Analytics & Insights', 'Data-driven insights into code quality', BarChart3);
      case 'collaboration':
        return renderPlaceholder('Team Collaboration', 'Collaborate with your team members', Users);
      case 'rules':
        return renderPlaceholder('AI Pattern Rules', 'Manage learned patterns from Layer 7', Sparkles);
      case 'integrations':
        return renderPlaceholder('Integrations', 'Connect with external tools and services', GitBranch);
      case 'profile':
        return renderPlaceholder('Profile Settings', 'Manage your account and preferences', User);
      case 'billing':
        return renderPlaceholder('Billing & Usage', 'View subscription and usage details', CreditCard);
      case 'settings':
        return renderPlaceholder('Settings', 'Configure your NeuroLint preferences', Settings);
      case 'help':
        return renderPlaceholder('Help & Support', 'Documentation and support resources', HelpCircle);
      default:
        return renderOverview();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white flex">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-zinc-900/50 border-r border-zinc-800 flex flex-col transition-all duration-300`}>
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <img src="/Bee logo.png" alt="NeuroLint" className="h-8 w-8 rounded-lg" />
                <div>
                  <h2 className="font-bold text-white">NeuroLint</h2>
                  <p className="text-xs text-zinc-400">Advanced Platform</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-zinc-400 hover:text-white"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id 
                      ? "bg-white text-black hover:bg-gray-100" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {!sidebarCollapsed && item.label}
                </Button>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="p-4 border-t border-zinc-800 space-y-1">
            {bottomSidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id 
                      ? "bg-white text-black hover:bg-gray-100" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {!sidebarCollapsed && item.label}
                </Button>
              );
            })}
            
            <Separator className="my-2 bg-zinc-800" />
            
            {/* User Profile */}
            <div className="flex items-center space-x-3 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-zinc-700 text-white">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              )}
              {!sidebarCollapsed && notifications > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {notifications}
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && 'Logout'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Top Header */}
          <div className="border-b border-zinc-800 bg-black/95 backdrop-blur-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Breadcrumb or current page indicator */}
                <div className="text-sm text-zinc-400">
                  Dashboard / {sidebarItems.find(item => item.id === activeTab)?.label || 'Overview'}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}