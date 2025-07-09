import React from "react";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Activity,
  DollarSign,
  FileText,
  TrendingUp,
  AlertTriangle,
  Settings,
  Database,
} from "lucide-react";

const ModernAdminDashboard: React.FC = () => {
  const adminStats = [
    {
      title: "Total Users",
      value: "1,847",
      change: "+12%",
      icon: Users,
      description: "Active users this month",
    },
    {
      title: "Revenue",
      value: "$24,580",
      change: "+18%",
      icon: DollarSign,
      description: "Monthly recurring revenue",
    },
    {
      title: "API Calls",
      value: "847K",
      change: "+25%",
      icon: Activity,
      description: "Total API requests",
    },
    {
      title: "Files Processed",
      value: "125K",
      change: "+8%",
      icon: FileText,
      description: "Files analyzed",
    },
  ];

  return (
    <AdminProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col h-full">
          <DashboardHeader
            title="Admin Dashboard"
            subtitle="System overview and management controls"
          />
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="p-6 space-y-6">
              {/* Admin Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow"
                    >
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
                          <Badge variant="default" className="mr-2">
                            {stat.change}
                          </Badge>
                          <span className="text-gray-500">
                            {stat.description}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Admin Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Controls</CardTitle>
                    <CardDescription>
                      Manage system-wide settings and configurations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Database Management
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      System Alerts
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest system events and user activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <div>
                          <p className="text-sm font-medium">
                            New user registered
                          </p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div>
                          <p className="text-sm font-medium">
                            System backup completed
                          </p>
                          <p className="text-xs text-gray-500">
                            15 minutes ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                        <div>
                          <p className="text-sm font-medium">
                            High API usage detected
                          </p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AdminProtectedRoute>
  );
};

export default ModernAdminDashboard;
