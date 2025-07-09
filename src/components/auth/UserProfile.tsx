import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export function UserProfile() {
  const { user, supabase } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setProfile(data);
          }
        } catch (error) {
          console.error('Unexpected error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, [user, supabase]);

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback>
                {(profile.full_name || profile.email).substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{profile.full_name || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Badge variant="secondary">{profile.plan_type} Plan</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Full Name</h4>
            <p className="text-sm text-muted-foreground">{profile.full_name || 'Not set'}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Email</h4>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            View your current subscription plan and usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Plan Type</h4>
            <p className="text-sm text-muted-foreground">{profile.plan_type || 'Free'}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Monthly Limit</h4>
            <p className="text-sm text-muted-foreground">{profile.monthly_limit || '25'}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Transformations Used</h4>
            <p className="text-sm text-muted-foreground">{profile.monthly_transformations_used || '0'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
