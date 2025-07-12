// Real-time Pattern Synchronization Client
// Integrates with Supabase real-time subscriptions for live pattern updates

import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface PatternUpdate {
  layerId: number;
  patterns: any[];
  metadata: Record<string, any>;
  isPublic: boolean;
  updatedAt: string;
  userId?: string;
}

export interface PatternSubscription {
  layerId: number;
  callback: (update: PatternUpdate) => void;
  channel?: RealtimeChannel;
}

class RealtimePatternManager {
  private subscriptions = new Map<number, PatternSubscription>();
  private isConnected = false;

  /**
   * Subscribe to real-time pattern updates for a specific layer
   */
  async subscribeToLayer(
    layerId: number,
    callback: (update: PatternUpdate) => void,
  ): Promise<boolean> {
    try {
      // Check if already subscribed
      if (this.subscriptions.has(layerId)) {
        console.warn(`Already subscribed to layer ${layerId}`);
        return true;
      }

      // Create subscription in database
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const response = await fetch("/api/v1/patterns/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ layerId }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to create subscription: ${response.statusText}`,
          );
        }
      }

      // Create Supabase real-time channel
      const channel = supabase
        .channel(`pattern-updates-${layerId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "neurolint_patterns",
            filter: `layer_id=eq.${layerId}`,
          },
          (payload) => {
            console.log(`[RealtimePatterns] Layer ${layerId} update:`, payload);

            const update: PatternUpdate = {
              layerId,
              patterns: payload.new?.patterns || [],
              metadata: payload.new?.metadata || {},
              isPublic: payload.new?.is_public || false,
              updatedAt: payload.new?.updated_at || new Date().toISOString(),
              userId: payload.new?.user_id,
            };

            callback(update);
          },
        )
        .subscribe((status) => {
          console.log(
            `[RealtimePatterns] Layer ${layerId} subscription status:`,
            status,
          );
          this.isConnected = status === "SUBSCRIBED";
        });

      // Store subscription
      this.subscriptions.set(layerId, {
        layerId,
        callback,
        channel,
      });

      console.log(
        `[RealtimePatterns] Subscribed to layer ${layerId} pattern updates`,
      );
      return true;
    } catch (error) {
      console.error(
        `[RealtimePatterns] Failed to subscribe to layer ${layerId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Unsubscribe from pattern updates for a specific layer
   */
  async unsubscribeFromLayer(layerId: number): Promise<boolean> {
    try {
      const subscription = this.subscriptions.get(layerId);
      if (!subscription) {
        console.warn(`No subscription found for layer ${layerId}`);
        return true;
      }

      // Remove Supabase real-time subscription
      if (subscription.channel) {
        await supabase.removeChannel(subscription.channel);
      }

      // Remove database subscription
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const response = await fetch(`/api/v1/patterns/subscribe/${layerId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (!response.ok) {
          console.warn(
            `Failed to remove database subscription: ${response.statusText}`,
          );
        }
      }

      // Remove local subscription
      this.subscriptions.delete(layerId);

      console.log(
        `[RealtimePatterns] Unsubscribed from layer ${layerId} pattern updates`,
      );
      return true;
    } catch (error) {
      console.error(
        `[RealtimePatterns] Failed to unsubscribe from layer ${layerId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Subscribe to multiple layers at once
   */
  async subscribeToMultipleLayers(
    layerIds: number[],
    callback: (layerId: number, update: PatternUpdate) => void,
  ): Promise<boolean[]> {
    const results = await Promise.all(
      layerIds.map((layerId) =>
        this.subscribeToLayer(layerId, (update) => callback(layerId, update)),
      ),
    );

    return results;
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): number[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Check if connected to real-time updates
   */
  isRealtimeConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Unsubscribe from all pattern updates
   */
  async unsubscribeFromAll(): Promise<void> {
    const layerIds = Array.from(this.subscriptions.keys());
    await Promise.all(
      layerIds.map((layerId) => this.unsubscribeFromLayer(layerId)),
    );
  }

  /**
   * Get user's pattern subscriptions from the server
   */
  async getUserSubscriptions(): Promise<PatternSubscription[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return [];
      }

      const response = await fetch("/api/v1/patterns/subscriptions", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch subscriptions: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.subscriptions || [];
    } catch (error) {
      console.error(
        "[RealtimePatterns] Failed to fetch user subscriptions:",
        error,
      );
      return [];
    }
  }

  /**
   * Manually trigger a pattern refresh for all subscribed layers
   */
  async refreshAllPatterns(): Promise<void> {
    const layerIds = this.getActiveSubscriptions();

    for (const layerId of layerIds) {
      try {
        const response = await fetch(
          `/api/v1/patterns/load?layerId=${layerId}`,
          {
            headers: {
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const subscription = this.subscriptions.get(layerId);

          if (subscription && data.success) {
            const update: PatternUpdate = {
              layerId: data.layerId,
              patterns: data.patterns,
              metadata: data.metadata,
              isPublic: data.isPublic,
              updatedAt: data.updatedAt,
            };

            subscription.callback(update);
          }
        }
      } catch (error) {
        console.error(
          `[RealtimePatterns] Failed to refresh layer ${layerId}:`,
          error,
        );
      }
    }
  }
}

// Export singleton instance
export const realtimePatterns = new RealtimePatternManager();

// React hook for easy pattern subscription
export function useRealtimePatterns(layerId: number, enabled = true) {
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [latestUpdate, setLatestUpdate] = React.useState<PatternUpdate | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled || !layerId) return;

    const handleUpdate = (update: PatternUpdate) => {
      setLatestUpdate(update);
      setError(null);
    };

    const subscribe = async () => {
      try {
        const success = await realtimePatterns.subscribeToLayer(
          layerId,
          handleUpdate,
        );
        setIsSubscribed(success);
        if (!success) {
          setError("Failed to subscribe to real-time updates");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsSubscribed(false);
      }
    };

    subscribe();

    return () => {
      realtimePatterns.unsubscribeFromLayer(layerId);
      setIsSubscribed(false);
    };
  }, [layerId, enabled]);

  return {
    isSubscribed,
    latestUpdate,
    error,
    refreshPatterns: () => realtimePatterns.refreshAllPatterns(),
  };
}

export default realtimePatterns;
