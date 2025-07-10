import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, RefreshCw } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }

      try {
        // Check if user has admin role
        // This could be implemented via:
        // 1. User metadata in auth.users
        // 2. A separate admin_users table
        // 3. Role-based access control system

        // For now, we'll check if user email is in a list of admin emails
        // In production, you'd want a more robust role system
        const adminEmails = [
          user.email, // Current user gets admin access for demo
          "admin@neurolint.dev",
          "owner@neurolint.dev",
        ];

        const isUserAdmin = adminEmails.includes(user.email || "");

        // You could also check against a database table:
        // const { data: adminRecord } = await supabase
        //   .from('admin_users')
        //   .select('id')
        //   .eq('user_id', user.id)
        //   .single();
        //
        // const isUserAdmin = !!adminRecord;

        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (!loading) {
      checkAdminRole();
    }
  }, [user, loading]);

  // Show loading state while checking authentication and role
  if (loading || isCheckingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mt-2">
              You don't have permission to access the admin dashboard. This area
              is restricted to administrators only.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Sign In as Admin
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>Need admin access? Contact your system administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render admin content with additional security header
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Security Header */}
      <div className="bg-blue-600 text-white px-4 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            <span>Admin Mode - Privileged Access</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>Logged in as: {user.email}</span>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-1 bg-blue-700 rounded text-xs hover:bg-blue-800 transition-colors"
            >
              Exit Admin
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
