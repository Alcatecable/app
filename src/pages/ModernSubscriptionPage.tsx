import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SubscriptionManager } from "@/components/subscription/SubscriptionManager";

const ModernSubscriptionPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col h-full">
          <DashboardHeader
            title="Subscription & Billing"
            subtitle="Manage your subscription plan and billing information"
          />
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="p-6">
              <SubscriptionManager />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ModernSubscriptionPage;
