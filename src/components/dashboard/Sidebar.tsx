import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Home,
  Activity,
  TestTube,
  Settings,
  User,
  CreditCard,
  Shield,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Code,
  Zap,
  FileCode,
  Brain,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      badge: null,
    },
    {
      title: "NeuroLint",
      href: "/neurolint",
      icon: Brain,
      badge: "AI",
    },
    {
      title: "Testing Suite",
      href: "/testing",
      icon: TestTube,
      badge: "New",
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      title: "Code Editor",
      href: "/editor",
      icon: FileCode,
      badge: null,
    },
  ];

  const accountItems = [
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Subscription",
      href: "/subscription",
      icon: CreditCard,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "Admin",
      href: "/admin",
      icon: Shield,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "relative h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center space-x-3">
            <img
              src="/Bee logo.png"
              alt="NeuroLint"
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">NeuroLint</h1>
              <p className="text-xs text-gray-500">AI Code Assistant</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="flex items-center justify-center w-full">
            <img
              src="/Bee logo.png"
              alt="NeuroLint"
              className="w-8 h-8 rounded-lg"
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main
            </p>
          )}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    active ? "text-blue-600" : "text-gray-400",
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="ml-3 flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant={active ? "default" : "secondary"}
                        className="ml-auto text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* Account Section */}
        <div className="pt-6 mt-6 border-t border-gray-100">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Account
            </p>
          )}
          {accountItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    active ? "text-blue-600" : "text-gray-400",
                  )}
                />
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-100 p-4">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                alcatecable@gmail.com
              </p>
              <Badge variant="outline" className="mt-1 text-xs">
                Free Plan
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
