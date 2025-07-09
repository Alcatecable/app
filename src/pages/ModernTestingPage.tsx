import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NeuroLintTester } from "@/components/testing/NeuroLintTester";

const ModernTestingPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col h-full">
          <DashboardHeader
            title="Testing Suite"
            subtitle="Comprehensive testing and quality assurance for NeuroLint"
          />
          <div className="flex-1 overflow-auto bg-gray-50">
            <NeuroLintTester />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ModernTestingPage;
