import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserProfile } from "@/components/auth/UserProfile";

const ModernProfilePage: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col h-full">
          <DashboardHeader
            title="Profile Settings"
            subtitle="Manage your account and preferences"
          />
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="p-6">
              <UserProfile />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ModernProfilePage;
