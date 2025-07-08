/**
 * Admin role management service
 * Provides secure, database-backed admin role checking
 */

import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
  granted_by: string;
  granted_at: string;
  permissions: string[];
  is_active: boolean;
}

export interface RoleCheckResult {
  isAdmin: boolean;
  role?: string;
  permissions: string[];
  error?: string;
}

class AdminRoleManagerService {
  private roleCache = new Map<
    string,
    { result: RoleCheckResult; timestamp: number }
  >();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if user has admin role with proper database verification
   */
  async checkAdminRole(userId: string): Promise<RoleCheckResult> {
    try {
      // Check cache first
      const cached = this.roleCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.result;
      }

      // Method 1: Check user metadata (Supabase auth.users)
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(userId);

      if (userError) {
        console.warn("Could not fetch user metadata:", userError.message);
      } else if (userData?.user?.user_metadata?.role) {
        const role = userData.user.user_metadata.role;
        if (["super_admin", "admin", "moderator"].includes(role)) {
          const result = {
            isAdmin: true,
            role,
            permissions: this.getRolePermissions(role),
          };
          this.roleCache.set(userId, { result, timestamp: Date.now() });
          return result;
        }
      }

      // Method 2: Check admin_users table (if exists)
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (!adminError && adminData) {
        const result = {
          isAdmin: true,
          role: adminData.role,
          permissions:
            adminData.permissions || this.getRolePermissions(adminData.role),
        };
        this.roleCache.set(userId, { result, timestamp: Date.now() });
        return result;
      }

      // Method 3: Fallback to environment-based admin list (development only)
      if (process.env.NODE_ENV === "development") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .single();

        if (profile?.email) {
          const devAdminEmails = [
            "admin@neurolint.dev",
            "owner@neurolint.dev",
            // Add other development admin emails here
          ];

          if (devAdminEmails.includes(profile.email)) {
            const result = {
              isAdmin: true,
              role: "admin",
              permissions: this.getRolePermissions("admin"),
            };
            this.roleCache.set(userId, { result, timestamp: Date.now() });
            return result;
          }
        }
      }

      // No admin role found
      const result = {
        isAdmin: false,
        permissions: [],
      };
      this.roleCache.set(userId, { result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error("Error checking admin role:", error);
      return {
        isAdmin: false,
        permissions: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get permissions for a given role
   */
  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      super_admin: [
        "manage_users",
        "manage_admins",
        "view_analytics",
        "manage_credentials",
        "system_settings",
        "billing_management",
        "data_export",
        "security_audit",
      ],
      admin: [
        "manage_users",
        "view_analytics",
        "manage_credentials",
        "system_settings",
        "data_export",
      ],
      moderator: ["view_analytics", "manage_users"],
    };

    return permissions[role] || [];
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const roleCheck = await this.checkAdminRole(userId);
    return roleCheck.permissions.includes(permission);
  }

  /**
   * Grant admin role to user (super admin only)
   */
  async grantAdminRole(
    targetUserId: string,
    role: "admin" | "moderator",
    grantedBy: string,
    permissions?: string[],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if granting user has super_admin role
      const granterRole = await this.checkAdminRole(grantedBy);
      if (!granterRole.isAdmin || granterRole.role !== "super_admin") {
        return {
          success: false,
          error: "Only super admins can grant admin roles",
        };
      }

      // Insert or update admin role
      const { error } = await supabase.from("admin_users").upsert({
        user_id: targetUserId,
        role,
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
        permissions: permissions || this.getRolePermissions(role),
        is_active: true,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Clear cache for target user
      this.roleCache.delete(targetUserId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Revoke admin role (super admin only)
   */
  async revokeAdminRole(
    targetUserId: string,
    revokedBy: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if revoking user has super_admin role
      const revokerRole = await this.checkAdminRole(revokedBy);
      if (!revokerRole.isAdmin || revokerRole.role !== "super_admin") {
        return {
          success: false,
          error: "Only super admins can revoke admin roles",
        };
      }

      // Deactivate admin role
      const { error } = await supabase
        .from("admin_users")
        .update({ is_active: false })
        .eq("user_id", targetUserId);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Clear cache for target user
      this.roleCache.delete(targetUserId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * List all admin users
   */
  async listAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select(
          `
          *,
          profiles:user_id (email)
        `,
        )
        .eq("is_active", true)
        .order("granted_at", { ascending: false });

      if (error) {
        console.error("Error fetching admin users:", error);
        return [];
      }

      return (
        data?.map((admin) => ({
          id: admin.user_id,
          email: admin.profiles?.email || "Unknown",
          role: admin.role,
          granted_by: admin.granted_by,
          granted_at: admin.granted_at,
          permissions: admin.permissions || [],
          is_active: admin.is_active,
        })) || []
      );
    } catch (error) {
      console.error("Error listing admin users:", error);
      return [];
    }
  }

  /**
   * Clear role cache for user
   */
  clearUserCache(userId: string): void {
    this.roleCache.delete(userId);
  }

  /**
   * Clear all role cache
   */
  clearAllCache(): void {
    this.roleCache.clear();
  }

  /**
   * Create admin_users table if it doesn't exist
   * This should be run during application setup
   */
  async initializeAdminTable(): Promise<void> {
    try {
      // This would typically be done via migrations
      // Including here for reference only
      console.log(
        "Admin table initialization should be done via database migrations",
      );
    } catch (error) {
      console.error("Error initializing admin table:", error);
    }
  }
}

export const adminRoleManager = new AdminRoleManagerService();

// SQL for creating admin_users table (run this in your Supabase SQL editor):
/*
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can manage admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users admin_check 
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'super_admin' 
      AND admin_check.is_active = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial super admin setup (replace with your email)
INSERT INTO admin_users (user_id, role, granted_by, permissions)
SELECT id, 'super_admin', id, ARRAY['manage_users', 'manage_admins', 'view_analytics', 'manage_credentials', 'system_settings', 'billing_management', 'data_export', 'security_audit']
FROM auth.users
WHERE email = 'your-admin-email@domain.com'
ON CONFLICT (user_id) DO NOTHING;
*/
