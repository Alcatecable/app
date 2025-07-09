import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { User, Mail, Calendar, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  email: string;
  full_name: string;
  plan_type: string;
  monthly_limit: number;
  monthly_transformations_used: number;
  created_at: string;
}

export function UserProfile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) {
      console.warn("No user ID available for profile fetch");
      setLoading(false);
      return;
    }

    console.log("Fetching profile for user:", user.id);

    try {
      // First try to get profile from profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.warn("Profile table error:", error.message);

        // If profiles table doesn't exist or has issues, create a fallback profile from auth user
        if (user) {
          const fallbackProfile: UserProfile = {
            email: user.email || "Unknown",
            full_name:
              user.user_metadata?.full_name || user.user_metadata?.name || "",
            plan_type: "free",
            monthly_limit: 25,
            monthly_transformations_used: 0,
            created_at: user.created_at || new Date().toISOString(),
          };
          setProfile(fallbackProfile);
          console.info("Using fallback profile data");
        } else {
          toast({
            title: "Profile Error",
            description: "Unable to load profile information",
            variant: "destructive",
          });
        }
      } else {
        // Ensure all required fields exist with fallbacks
        const profileData: UserProfile = {
          email: data?.email || user?.email || "Unknown",
          full_name:
            data?.full_name ||
            data?.name ||
            user?.user_metadata?.full_name ||
            "",
          plan_type: data?.plan_type || "free",
          monthly_limit: data?.monthly_limit || 25,
          monthly_transformations_used: data?.monthly_transformations_used || 0,
          created_at:
            data?.created_at || user?.created_at || new Date().toISOString(),
        };
        setProfile(profileData);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Profile fetch error:", errorMessage);

      // Create fallback profile even on catch
      if (user) {
        const fallbackProfile: UserProfile = {
          email: user.email || "Unknown",
          full_name: user.user_metadata?.full_name || "",
          plan_type: "free",
          monthly_limit: 25,
          monthly_transformations_used: 0,
          created_at: user.created_at || new Date().toISOString(),
        };
        setProfile(fallbackProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Unable to load profile
          </p>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage =
    (profile.monthly_transformations_used / profile.monthly_limit) * 100;
  const remainingTransformations =
    profile.monthly_limit - profile.monthly_transformations_used;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
        <CardDescription>
          Manage your account settings and view usage statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Full Name
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.full_name || "Not provided"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Email
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Crown className="h-4 w-4" />
              Plan Type
            </div>
            <Badge
              variant={profile.plan_type === "pro" ? "default" : "secondary"}
            >
              {profile.plan_type.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Member Since
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Monthly Usage</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Transformations Used</span>
              <span className="font-medium">
                {profile.monthly_transformations_used} / {profile.monthly_limit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {remainingTransformations} transformations remaining this month
            </p>
          </div>

          {usagePercentage > 80 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You're approaching your monthly limit. Consider upgrading to Pro
                for unlimited transformations.
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
