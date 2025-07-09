import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCards } from "@/components/dashboard/DashboardCards";

const ModernDashboard: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col h-full">
          <DashboardHeader
            title="Dashboard"
            subtitle="Welcome back to your NeuroLint workspace"
          />
          <div className="flex-1 overflow-auto">
            <DashboardCards />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ModernDashboard;
