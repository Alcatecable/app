import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TrendingUp,
  FileText,
  Clock,
  Users,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

export const DashboardCards: React.FC = () => {
  const stats = [
    {
      title: "Files Processed",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
      icon: FileText,
      description: "Files analyzed this month",
    },
    {
      title: "Issues Fixed",
      value: "1,293",
      change: "+8%",
      changeType: "positive" as const,
      icon: CheckCircle2,
      description: "Automatically resolved",
    },
    {
      title: "Performance Gain",
      value: "24.5%",
      change: "+3.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Average improvement",
    },
    {
      title: "Processing Time",
      value: "1.2s",
      change: "-15%",
      changeType: "positive" as const,
      icon: Clock,
      description: "Average per file",
    },
  ];

  const recentActivity = [
    {
      type: "fix",
      title: "Added key props to UserList component",
      file: "components/UserList.tsx",
      time: "2 minutes ago",
      status: "completed",
    },
    {
      type: "optimization",
      title: "Optimized hydration in Dashboard",
      file: "pages/Dashboard.tsx",
      time: "5 minutes ago",
      status: "completed",
    },
    {
      type: "test",
      title: "Added React.memo to ProductCard",
      file: "components/ProductCard.tsx",
      time: "12 minutes ago",
      status: "completed",
    },
    {
      type: "warning",
      title: "Potential hydration mismatch detected",
      file: "components/TimeDisplay.tsx",
      time: "18 minutes ago",
      status: "pending",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="flex items-center text-xs">
                  <Badge
                    variant={
                      stat.changeType === "positive" ? "default" : "destructive"
                    }
                    className="mr-2"
                  >
                    {stat.change}
                  </Badge>
                  <span className="text-gray-500">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Activity
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </CardTitle>
            <CardDescription>
              Latest NeuroLint processing results and optimizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "completed"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <Badge
                        variant={
                          activity.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-600 font-mono">
                      {activity.file}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Usage Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Usage</CardTitle>
              <CardDescription>Free plan: 450 / 500 files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={90} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">90% used</span>
                <span className="text-blue-600 font-medium">50 remaining</span>
              </div>
              <Button className="w-full" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade for Unlimited
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Analyze New File
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Run Test Suite
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                System Status
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>AI Processing</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Pattern Learning</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>API Response</span>
                <Badge variant="secondary">142ms</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
