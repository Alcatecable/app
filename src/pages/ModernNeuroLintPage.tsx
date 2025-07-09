import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NeuroLintClient } from "@/components/neurolint/NeuroLintClient";

const ModernNeuroLintPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col h-full">
          <DashboardHeader
            title="NeuroLint AI"
            subtitle="Intelligent code analysis and optimization powered by AI"
          />
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="p-6">
              <NeuroLintClient />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ModernNeuroLintPage;
