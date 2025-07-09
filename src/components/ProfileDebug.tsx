import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export function ProfileDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user]);

  const runDiagnostics = async () => {
    const info: any = {
      userExists: !!user,
      userId: user?.id,
      userEmail: user?.email,
      profilesTableExists: false,
      profileData: null,
      profileError: null,
    };

    if (user) {
      try {
        // Test profiles table access
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          info.profilesTableExists = false;
          info.profileError = error.message;
        } else {
          info.profilesTableExists = true;
          info.profileData = data;
        }
      } catch (error) {
        info.profileError =
          error instanceof Error ? error.message : "Unknown error";
      }

      // Test if profiles table exists at all
      try {
        const { error: tableError } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);

        if (!tableError) {
          info.profilesTableExists = true;
        }
      } catch (error) {
        // Table likely doesn't exist
      }
    }

    setDebugInfo(info);
  };

  if (!debugInfo) {
    return <div>Running diagnostics...</div>;
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Profile Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {debugInfo.userExists ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">User Authenticated</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {debugInfo.userExists ? "Yes" : "No"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="font-medium">User ID</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              {debugInfo.userId || "None"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="font-medium">Email</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {debugInfo.userEmail || "None"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {debugInfo.profilesTableExists ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="font-medium">Profiles Table</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {debugInfo.profilesTableExists ? "Accessible" : "Not accessible"}
            </p>
          </div>
        </div>

        {debugInfo.profileError && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Profile Error
                </p>
                <p className="text-xs text-yellow-700">
                  {debugInfo.profileError}
                </p>
              </div>
            </div>
          </div>
        )}

        {debugInfo.profileData && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Profile Data Found
                </p>
                <pre className="text-xs text-green-700 mt-1 font-mono">
                  {JSON.stringify(debugInfo.profileData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Status:</strong> Profile error handling has been improved
            with fallback data.
          </p>
          <p>
            <strong>Fix:</strong> The app will now use fallback profile data if
            the profiles table is not available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
