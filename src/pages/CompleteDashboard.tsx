import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  GitBranch,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database,
  Bell,
} from "lucide-react";

// Import existing transformation components
import Dashboard from "./Dashboard";
import Onboarding from "@/components/Onboarding";

interface DashboardData {
  totalTransformations: number;
  successRate: number;
  averageExecutionTime: number;
  layerUsage: { [key: number]: number };
  recentTransformations: Array<{
    id: string;
    fileName: string;
    timestamp: Date;
    status: "success" | "failed";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user needs onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(
      "neurolint_onboarding_completed",
    );
    if (!hasCompletedOnboarding && user) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Fetch real data from API
  useEffect(() => {
    fetchDashboardData();
    fetchProjects();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/dashboard/metrics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/v1/projects", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "transform", label: "Transform", icon: Zap },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "history", label: "History", icon: History },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "collaboration", label: "Team", icon: Users },
    { id: "rules", label: "Pattern Rules", icon: Settings },
    { id: "integrations", label: "Integrations", icon: GitBranch },
  ];

  const bottomSidebarItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  const handleOnboardingComplete = () => {
    localStorage.setItem("neurolint_onboarding_completed", "true");
    setShowOnboarding(false);
    toast({
      title: "Welcome to NeuroLint!",
      description: "You're all set up. Start transforming your code!",
    });
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("neurolint_onboarding_completed", "true");
    setShowOnboarding(false);
    toast({
      title: "Skipped Onboarding",
      description:
        "You can always access help and tutorials from the Help menu.",
    });
  };

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

  const renderOverview = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-zinc-400 mt-1">Loading your metrics...</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2"></div>
                  <div className="h-8 bg-zinc-800 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-zinc-400 mt-1">Error loading data</p>
            </div>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:text-white"
            >
              Retry
            </Button>
          </div>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-orange-500">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.email?.split("@")[0] || "Developer"}
            </h1>
            <p className="text-zinc-400 mt-1">
              Your code transformation metrics and recent activity.
            </p>
          </div>
          <Button
            className="bg-white hover:bg-gray-100 text-black"
            onClick={() => setActiveTab("transform")}
          >
            <Zap className="mr-2 h-4 w-4" />
            Transform Code
          </Button>
        </div>

        {/* Metrics Grid */}
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
                {dashboardData?.totalTransformations.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-zinc-400 mt-1">Lifetime total</p>
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
                {dashboardData?.successRate || 0}%
              </div>
              <Progress
                value={dashboardData?.successRate || 0}
                className="mt-2"
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
                {dashboardData?.averageExecutionTime || 0}s
              </div>
              <p className="text-xs text-zinc-400 mt-1">Per transformation</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                API Usage
              </CardTitle>
              <Database className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardData?.quota.used || 0}/
                {dashboardData?.quota.total || 1000}
              </div>
              <Progress
                value={
                  ((dashboardData?.quota.used || 0) /
                    (dashboardData?.quota.total || 1)) *
                  100
                }
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Layer Usage */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-zinc-400">
                Latest code transformations and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentTransformations?.length ? (
                <div className="space-y-4">
                  {dashboardData.recentTransformations.map((transformation) => (
                    <div
                      key={transformation.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                    >
                      <div className="flex items-center space-x-3">
                        {transformation.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {transformation.fileName}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {formatTimeAgo(transformation.timestamp)} •{" "}
                            {transformation.executionTime}s
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
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">
                    No recent transformations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Layer Usage</CardTitle>
              <CardDescription className="text-zinc-400">
                Transformation layer usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.layerUsage ? (
                <div className="space-y-4">
                  {Object.entries(dashboardData.layerUsage).map(
                    ([layer, usage]) => (
                      <div key={layer} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-300">Layer {layer}</span>
                          <span className="text-zinc-400">{usage}%</span>
                        </div>
                        <Progress value={usage} />
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">
                    No usage data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-zinc-400">
              Common tasks and workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                onClick={() => setActiveTab("transform")}
              >
                <Zap className="mr-2 h-4 w-4" />
                Transform Code
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                onClick={() => setActiveTab("projects")}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                New Project
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                onClick={() => setActiveTab("integrations")}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Connect GitHub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-zinc-400 mt-1">
            Organize and manage your code transformation projects
          </p>
        </div>
        <Button className="bg-white hover:bg-gray-100 text-black">
          <FolderOpen className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
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
                    <span className="text-white">
                      {project.totalTransformations}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Last Updated</span>
                    <span className="text-white">
                      {formatTimeAgo(project.lastUpdated)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No projects yet
            </h3>
            <p className="text-zinc-400 text-center max-w-md mb-4">
              Create your first project to organize your code transformations.
            </p>
            <Button className="bg-white hover:bg-gray-100 text-black">
              <FolderOpen className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPlaceholder = (title: string, description: string, icon: any) => {
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
              This feature is currently under development.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "transform":
        return <Dashboard />;
      case "projects":
        return renderProjects();
      case "history":
        return renderPlaceholder(
          "Transformation History",
          "View and manage your transformation history",
          History,
        );
      case "analytics":
        return renderPlaceholder(
          "Analytics",
          "Performance insights and code quality metrics",
          BarChart3,
        );
      case "collaboration":
        return renderPlaceholder(
          "Team Collaboration",
          "Collaborate with your team members",
          Users,
        );
      case "rules":
        return renderPlaceholder(
          "Pattern Rules",
          "Manage transformation patterns and rules",
          Settings,
        );
      case "integrations":
        return renderPlaceholder(
          "Integrations",
          "Connect with external tools and services",
          GitBranch,
        );
      case "profile":
        return renderPlaceholder(
          "Profile Settings",
          "Manage your account and preferences",
          User,
        );
      case "billing":
        return renderPlaceholder(
          "Billing",
          "View subscription and usage details",
          CreditCard,
        );
      case "settings":
        return renderPlaceholder(
          "Settings",
          "Configure your preferences",
          Settings,
        );
      case "help":
        return renderPlaceholder(
          "Help",
          "Documentation and support resources",
          HelpCircle,
        );
      default:
        return renderOverview();
    }
  };

  // Show onboarding if user hasn't completed it
  if (showOnboarding) {
    return (
      <ProtectedRoute>
        <Onboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white flex">
        {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-zinc-900/50 border-r border-zinc-800 flex flex-col transition-all duration-300`}
        >
          {/* Logo & Toggle */}
          <div className="flex items-center justify-end p-4 border-b border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-zinc-400 hover:text-white"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
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
                  {user?.email?.[0].toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && "Logout"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Top Header */}
          <div className="border-b border-zinc-800 bg-black/95 backdrop-blur-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-zinc-400">
                  Dashboard /{" "}
                  {sidebarItems.find((item) => item.id === activeTab)?.label ||
                    "Overview"}
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
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
