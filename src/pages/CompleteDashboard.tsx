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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  Code,
  Share,
  Lock,
  Globe,
  Calendar,
  TrendingUp,
  Target,
  Layers,
  Terminal,
  Book,
  Mail,
  ExternalLink,
  Copy,
  Trash,
  Edit,
  Plus,
  Minus,
  Save,
  Shield,
  Key,
  Server,
  Monitor,
  Cpu
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

interface TransformationHistoryItem {
  id: string;
  timestamp: Date;
  fileName: string;
  projectName: string;
  layersUsed: number[];
  status: 'success' | 'failed' | 'partial';
  executionTime: number;
  changesCount: number;
  beforeSize: number;
  afterSize: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  lastActive: Date;
  transformationsCount: number;
}

interface PatternRule {
  id: string;
  name: string;
  description: string;
  layer: number;
  pattern: string;
  replacement: string;
  enabled: boolean;
  usageCount: number;
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

  // Additional state for new tabs
  const [historyItems, setHistoryItems] = useState<TransformationHistoryItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [patternRules, setPatternRules] = useState<PatternRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
    fetchHistoryData();
    fetchAnalytics();
    fetchTeamData();
    fetchPatternRules();
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

  const fetchHistoryData = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        status: filterStatus,
        search: searchTerm
      });

      const response = await fetch(`/api/v1/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API data to match our interface
      const transformedHistory = (data.history || []).map((item: any) => ({
        id: item.id,
        timestamp: new Date(item.created_at),
        fileName: `file-${item.id.slice(-8)}.tsx`,
        projectName: 'Default Project',
        layersUsed: item.enabled_layers || [],
        status: item.successful_layers > 0 ? 'success' : 'failed',
        executionTime: Math.round(item.total_execution_time_ms / 1000),
        changesCount: item.improvement_score || 0,
        beforeSize: item.code_size_before || 0,
        afterSize: item.code_size_after || 0
      }));

      setHistoryItems(transformedHistory);
    } catch (error) {
      console.error('Failed to fetch history data:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/v1/analytics?timeRange=7d', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Analytics data will be used in renderAnalytics
      // Store in component state if needed
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    }
  };

  const fetchTeamData = async () => {
    try {
      const response = await fetch('/api/v1/team', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    }
  };

  const fetchPatternRules = async () => {
    try {
      const response = await fetch('/api/v1/patterns/load', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform pattern data to match our interface
      const rules: PatternRule[] = [];
      if (data.patterns) {
        Object.entries(data.patterns).forEach(([layerId, patternData]: [string, any]) => {
          if (patternData.patterns && Array.isArray(patternData.patterns)) {
            patternData.patterns.forEach((pattern: any, index: number) => {
              rules.push({
                id: `${layerId}-${index}`,
                name: pattern.name || `Layer ${layerId} Pattern ${index + 1}`,
                description: pattern.description || `Pattern for layer ${layerId}`,
                layer: parseInt(layerId),
                pattern: pattern.pattern || '',
                replacement: pattern.replacement || '',
                enabled: true,
                usageCount: pattern.usageCount || 0
              });
            });
          }
        });
      }
      
      setPatternRules(rules);
    } catch (error) {
      console.error('Failed to fetch pattern rules:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-white';
      case 'failed': return 'text-zinc-400';
      case 'partial': return 'text-zinc-300';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'failed': return AlertTriangle;
      case 'partial': return Clock;
      default: return Clock;
    }
  };

  const renderHistory = () => {
    const filteredHistory = historyItems.filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (searchTerm && !item.fileName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Transformation History</h1>
            <p className="text-zinc-400 mt-1">View and manage your transformation history</p>
          </div>
          <Button 
            onClick={() => fetchHistoryData()}
            variant="outline" 
            className="border-zinc-700 text-zinc-300 hover:text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search transformations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-zinc-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Recent Transformations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredHistory.length > 0 ? (
              <div className="space-y-3">
                {filteredHistory.map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(item.status)}`} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-white">{item.fileName}</p>
                            <span className="text-xs text-zinc-500">in {item.projectName}</span>
                          </div>
                          <p className="text-xs text-zinc-400">
                            {formatTimeAgo(item.timestamp)} • {item.executionTime}s • {item.changesCount} changes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          {item.layersUsed.map((layer) => (
                            <Badge 
                              key={layer} 
                              variant="secondary" 
                              className="text-xs bg-zinc-700 text-zinc-300 border-zinc-600"
                            >
                              L{layer}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-zinc-400 min-w-[80px] text-right">
                          {item.beforeSize} → {item.afterSize} bytes
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No transformations found</h3>
                <p className="text-zinc-400">No transformations match your current filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
      const fetchAnalyticsData = async () => {
        try {
          const response = await fetch(`/api/v1/analytics?timeRange=${timeRange}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAnalyticsData(data);
          }
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
        }
      };

      fetchAnalyticsData();
    }, [timeRange]);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-zinc-400 mt-1">Performance insights and code quality metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {analyticsData ? (
          <>
            {/* API Usage Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Total Requests</CardTitle>
                  <Server className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.apiUsage.totalRequests.toLocaleString()}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">API calls made</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.apiUsage.avgResponseTime}ms
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Average latency</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.apiUsage.errorRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Failed requests</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Successful Transforms</CardTitle>
                  <CheckCircle className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.transformations.successful}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    of {analyticsData.transformations.total} total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Layer Usage and Endpoint Usage */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Layer Usage Distribution</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Most frequently used transformation layers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.transformations.layerUsage || {}).map(([layer, count]) => (
                      <div key={layer} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-300">Layer {layer}</span>
                          <span className="text-zinc-400">{count as number} uses</span>
                        </div>
                        <Progress 
                          value={((count as number) / analyticsData.transformations.total) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">API Endpoint Usage</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Most frequently accessed endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.apiUsage.endpointUsage || {}).slice(0, 5).map(([endpoint, count]) => (
                      <div key={endpoint} className="flex justify-between items-center">
                        <span className="text-sm text-zinc-300 font-mono">{endpoint}</span>
                        <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                          {count as number}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Code Improvements */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Code Quality Impact</CardTitle>
                <CardDescription className="text-zinc-400">
                  Improvements made to your codebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {analyticsData.transformations.codeImprovements.totalChanges}
                    </div>
                    <div className="text-sm text-zinc-400">Total Improvements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {analyticsData.transformations.codeImprovements.averageImprovement}
                    </div>
                    <div className="text-sm text-zinc-400">Avg Score per Transform</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {analyticsData.transformations.averageExecutionTime}ms
                    </div>
                    <div className="text-sm text-zinc-400">Avg Execution Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Loading Analytics</h3>
              <p className="text-zinc-400 text-center max-w-md">
                Gathering your performance data and insights...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTeam = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Team Collaboration</h1>
            <p className="text-zinc-400 mt-1">Manage team members and collaboration settings</p>
          </div>
          <Button className="bg-white hover:bg-gray-100 text-black">
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {teamMembers.length > 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Team Members</CardTitle>
              <CardDescription className="text-zinc-400">
                Manage access and permissions for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-zinc-700 text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        <p className="text-xs text-zinc-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className="bg-zinc-700 text-zinc-300"
                      >
                        {member.role}
                      </Badge>
                      <div className="text-xs text-zinc-400">
                        {member.transformationsCount} transforms
                      </div>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Team Features Coming Soon</h3>
              <p className="text-zinc-400 text-center max-w-md mb-4">
                Team collaboration features are available with enterprise plans. 
                Invite team members, manage permissions, and share pattern libraries.
              </p>
              <Button variant="outline" className="border-zinc-700 text-zinc-300">
                <Mail className="mr-2 h-4 w-4" />
                Request Enterprise Access
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPatternRules = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pattern Rules</h1>
            <p className="text-zinc-400 mt-1">Manage transformation patterns and rule configurations</p>
          </div>
          <Button className="bg-white hover:bg-gray-100 text-black">
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>

        {/* Layer Filters */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Label className="text-zinc-300">Filter by Layer:</Label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6].map((layer) => (
                  <Button
                    key={layer}
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                  >
                    Layer {layer}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pattern Rules List */}
        <div className="grid gap-4">
          {patternRules.length > 0 ? (
            patternRules.map((rule) => (
              <Card key={rule.id} className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className="bg-zinc-700 text-zinc-300"
                      >
                        Layer {rule.layer}
                      </Badge>
                      <CardTitle className="text-white text-lg">{rule.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={rule.enabled} className="data-[state=checked]:bg-white" />
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-zinc-400">
                    {rule.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-zinc-300">Pattern</Label>
                        <div className="mt-1 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                          <code className="text-sm text-zinc-300 font-mono">{rule.pattern}</code>
                        </div>
                      </div>
                      <div>
                        <Label className="text-zinc-300">Replacement</Label>
                        <div className="mt-1 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                          <code className="text-sm text-zinc-300 font-mono">{rule.replacement}</code>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">
                        Used {rule.usageCount} times
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layers className="h-12 w-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Custom Rules</h3>
                <p className="text-zinc-400 text-center max-w-md mb-4">
                  Create custom transformation rules to extend the built-in layer functionality.
                </p>
                <Button variant="outline" className="border-zinc-700 text-zinc-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderIntegrations = () => {
    const [integrations, setIntegrations] = useState<any>(null);

    useEffect(() => {
      const fetchIntegrations = async () => {
        try {
          const response = await fetch('/api/v1/integrations', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setIntegrations(data);
          }
        } catch (error) {
          console.error('Failed to fetch integrations:', error);
        }
      };

      fetchIntegrations();
    }, []);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'text-white';
        case 'connected': return 'text-white';
        case 'available': return 'text-zinc-400';
        case 'configured': return 'text-zinc-300';
        default: return 'text-zinc-500';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'active': return CheckCircle;
        case 'connected': return CheckCircle;
        case 'available': return Download;
        case 'configured': return Settings;
        default: return Minus;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Integrations</h1>
            <p className="text-zinc-400 mt-1">Connect with external tools and services</p>
          </div>
          <div className="text-sm text-zinc-400">
            {integrations?.connectedIntegrations || 0} of {integrations?.availableIntegrations || 0} connected
          </div>
        </div>

        {integrations ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(integrations.integrations).map(([key, integration]: [string, any]) => {
              const StatusIcon = getStatusIcon(integration.status);
              return (
                <Card key={key} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <GitBranch className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white">{integration.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <StatusIcon className={`h-4 w-4 ${getStatusColor(integration.status)}`} />
                            <span className={`text-sm ${getStatusColor(integration.status)}`}>
                              {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={integration.status === 'disconnected' ? 'default' : 'outline'}
                        size="sm"
                        className={integration.status === 'disconnected' 
                          ? 'bg-white hover:bg-gray-100 text-black'
                          : 'border-zinc-700 text-zinc-300 hover:text-white'
                        }
                      >
                        {integration.status === 'disconnected' ? 'Connect' : 'Configure'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400 text-sm">{integration.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GitBranch className="h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Loading Integrations</h3>
              <p className="text-zinc-400 text-center max-w-md">
                Checking available integrations and connection status...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderProfile = () => {
    const [profileData, setProfileData] = useState<any>(null);

    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/v1/profile', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      };

      fetchProfile();
    }, []);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-zinc-400 mt-1">Manage your account and preferences</p>
          </div>
          <Button className="bg-white hover:bg-gray-100 text-black">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {profileData ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Account Information</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Your basic account details and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-zinc-300">Email</Label>
                      <Input
                        value={profileData.email}
                        disabled
                        className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Member Since</Label>
                      <Input
                        value={new Date(profileData.createdAt).toLocaleDateString()}
                        disabled
                        className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Preferences</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Customize your NeuroLint experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-zinc-300">Email Notifications</Label>
                      <p className="text-sm text-zinc-400">Receive updates about your transformations</p>
                    </div>
                    <Switch 
                      checked={profileData.preferences.emailNotifications}
                      className="data-[state=checked]:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Default Layers</Label>
                    <p className="text-sm text-zinc-400 mb-2">Layers selected by default for new transformations</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5, 6].map((layer) => (
                        <Badge
                          key={layer}
                          variant={profileData.preferences.defaultLayers.includes(layer) ? "default" : "secondary"}
                          className={profileData.preferences.defaultLayers.includes(layer) 
                            ? "bg-white text-black" 
                            : "bg-zinc-700 text-zinc-300"
                          }
                        >
                          L{layer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div className="space-y-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {profileData.statistics.totalTransformations}
                    </div>
                    <div className="text-sm text-zinc-400">Total Transformations</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {((profileData.statistics.successfulTransformations / profileData.statistics.totalTransformations) * 100 || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-zinc-400">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {profileData.statistics.averageExecutionTime}ms
                    </div>
                    <div className="text-sm text-zinc-400">Avg Execution Time</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Current Quota</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300">Used this month</span>
                      <span className="text-white">
                        {profileData.quota.used_transformations} / {profileData.quota.monthly_transformations}
                      </span>
                    </div>
                    <Progress 
                      value={(profileData.quota.used_transformations / profileData.quota.monthly_transformations) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-zinc-400">
                      Resets on {new Date(profileData.quota.quota_reset_date).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Loading Profile</h3>
              <p className="text-zinc-400 text-center max-w-md">
                Retrieving your account information and preferences...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderBilling = () => {
    const [billingData, setBillingData] = useState<any>(null);

    useEffect(() => {
      const fetchBilling = async () => {
        try {
          const response = await fetch('/api/v1/billing', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setBillingData(data);
          }
        } catch (error) {
          console.error('Failed to fetch billing:', error);
        }
      };

      fetchBilling();
    }, []);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Billing</h1>
            <p className="text-zinc-400 mt-1">View subscription and usage details</p>
          </div>
          {billingData && (
            <Badge 
              variant="secondary" 
              className="bg-zinc-700 text-zinc-300"
            >
              {billingData.plan}
            </Badge>
          )}
        </div>

        {billingData ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Current Plan */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Current Plan</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Your active subscription details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{billingData.plan}</h3>
                        <p className="text-sm text-zinc-400">Status: {billingData.status}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">Included Features:</h4>
                      <ul className="space-y-1">
                        {billingData.features.map((feature: string, index: number) => (
                          <li key={index} className="text-sm text-zinc-400 flex items-center">
                            <CheckCircle className="h-4 w-4 text-zinc-400 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Options */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Upgrade Options</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Unlock more features and higher limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {billingData.upgradeOptions.map((option: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-medium text-white">{option.name}</h3>
                            <p className="text-sm text-zinc-400">{option.price}</p>
                          </div>
                          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                            Contact Sales
                          </Button>
                        </div>
                        <ul className="space-y-1">
                          {option.features.map((feature: string, idx: number) => (
                            <li key={idx} className="text-sm text-zinc-400 flex items-center">
                              <CheckCircle className="h-4 w-4 text-zinc-400 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Summary */}
            <div className="space-y-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Usage This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-300">Transformations</span>
                        <span className="text-white">
                          {billingData.usage.currentPeriod} / {billingData.usage.limit}
                        </span>
                      </div>
                      <Progress 
                        value={(billingData.usage.currentPeriod / billingData.usage.limit) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="text-xs text-zinc-400">
                      Resets on {new Date(billingData.usage.resetDate).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Need More?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 mb-4">
                    Running low on transformations? Upgrade to get higher limits and advanced features.
                  </p>
                  <Button className="w-full bg-white hover:bg-gray-100 text-black">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Loading Billing Information</h3>
              <p className="text-zinc-400 text-center max-w-md">
                Retrieving your subscription details and usage information...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-zinc-400 mt-1">Configure your preferences and account settings</p>
          </div>
          <Button className="bg-white hover:bg-gray-100 text-black">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>

        <div className="grid gap-6">
          {/* General Settings */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">General</CardTitle>
              <CardDescription className="text-zinc-400">
                Basic application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300">Dark Theme</Label>
                  <p className="text-sm text-zinc-400">Use dark mode interface</p>
                </div>
                <Switch checked={true} className="data-[state=checked]:bg-white" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300">Auto-save Transformations</Label>
                  <p className="text-sm text-zinc-400">Automatically save successful transformations</p>
                </div>
                <Switch checked={true} className="data-[state=checked]:bg-white" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300">Show Preview Before Apply</Label>
                  <p className="text-sm text-zinc-400">Always show changes before applying transformations</p>
                </div>
                <Switch checked={true} className="data-[state=checked]:bg-white" />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Security</CardTitle>
              <CardDescription className="text-zinc-400">
                Account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300">Two-Factor Authentication</Label>
                  <p className="text-sm text-zinc-400">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                  <Shield className="mr-2 h-4 w-4" />
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300">API Access</Label>
                  <p className="text-sm text-zinc-400">Manage API keys and access tokens</p>
                </div>
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                  <Key className="mr-2 h-4 w-4" />
                  Manage Keys
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transformation Settings */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Transformation Defaults</CardTitle>
              <CardDescription className="text-zinc-400">
                Default settings for code transformations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-300">Default Layers</Label>
                <p className="text-sm text-zinc-400 mb-3">Select which layers are enabled by default</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 1, name: 'Configuration', enabled: true },
                    { id: 2, name: 'Pattern Recognition', enabled: true },
                    { id: 3, name: 'Component Enhancement', enabled: true },
                    { id: 4, name: 'Hydration & SSR', enabled: false },
                    { id: 5, name: 'Next.js App Router', enabled: false },
                    { id: 6, name: 'Testing & Validation', enabled: false },
                  ].map((layer) => (
                    <div key={layer.id} className="flex items-center space-x-2">
                      <Switch 
                        checked={layer.enabled}
                        className="data-[state=checked]:bg-white"
                      />
                      <Label className="text-zinc-300 text-sm">Layer {layer.id}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-zinc-300">Timeout (seconds)</Label>
                <Input
                  type="number"
                  defaultValue="30"
                  className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderHelp = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Help & Support</h1>
            <p className="text-zinc-400 mt-1">Documentation, tutorials, and support resources</p>
          </div>
          <Button className="bg-white hover:bg-gray-100 text-black">
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Help */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Start</CardTitle>
              <CardDescription className="text-zinc-400">
                Get up and running with NeuroLint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <Book className="mr-3 h-4 w-4" />
                Getting Started Guide
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <Terminal className="mr-3 h-4 w-4" />
                CLI Documentation
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <Code className="mr-3 h-4 w-4" />
                API Reference
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <Layers className="mr-3 h-4 w-4" />
                Layer Documentation
              </Button>
            </CardContent>
          </Card>

          {/* Support Options */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Support Options</CardTitle>
              <CardDescription className="text-zinc-400">
                Get help when you need it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <HelpCircle className="mr-3 h-4 w-4" />
                FAQ & Common Issues
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <Mail className="mr-3 h-4 w-4" />
                Email Support
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <ExternalLink className="mr-3 h-4 w-4" />
                Community Forum
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <FileText className="mr-3 h-4 w-4" />
                Submit Bug Report
              </Button>
            </CardContent>
          </Card>

          {/* Layer Help */}
          <Card className="bg-zinc-900/50 border-zinc-800 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Layer Reference</CardTitle>
              <CardDescription className="text-zinc-400">
                Quick reference for transformation layers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { id: 1, name: 'Configuration', description: 'TypeScript and build configuration fixes' },
                  { id: 2, name: 'Pattern Recognition', description: 'HTML entities and pattern cleanup' },
                  { id: 3, name: 'Component Enhancement', description: 'React component improvements' },
                  { id: 4, name: 'Hydration & SSR', description: 'Server-side rendering safety' },
                  { id: 5, name: 'Next.js App Router', description: 'Next.js 13+ optimizations' },
                  { id: 6, name: 'Testing & Validation', description: 'Error handling and testing' },
                ].map((layer) => (
                  <div key={layer.id} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                        Layer {layer.id}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-white">{layer.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{layer.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
      case 'history':
        return renderHistory();
      case 'analytics':
        return renderAnalytics();
      case 'collaboration':
        return renderTeam();
      case 'rules':
        return renderPatternRules();
      case 'integrations':
        return renderIntegrations();
      case 'profile':
        return renderProfile();
      case 'billing':
        return renderBilling();
      case 'settings':
        return renderSettings();
      case 'help':
        return renderHelp();
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
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F67fb758850bf4dabaa407a94333b37bf%2F3447f66931a74d53961eee8fc18d06b9?format=webp&width=800"
                  alt="NeuroLint Logo"
                  className="h-8 w-auto"
                />
              </div>
            )}
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
                  variant="ghost"
                  className={`w-full justify-start ${
                    activeTab === item.id
                      ? "text-white hover:bg-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon
                    className={`h-4 w-4 mr-3 ${
                      activeTab === item.id ? "text-blue-400" : ""
                    }`}
                  />
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
                  variant="ghost"
                  className={`w-full justify-start ${
                    activeTab === item.id
                      ? "text-white hover:bg-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon
                    className={`h-4 w-4 mr-3 ${
                      activeTab === item.id ? "text-blue-400" : ""
                    }`}
                  />
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
