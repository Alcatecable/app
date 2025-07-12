
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { LearnedPattern } from './types';

export interface RealtimePattern {
  id: string;
  patterns: Record<string, any>;
  metadata: Record<string, any>;
  is_public: boolean;
  updated_at: string;
  user_id: string;
}

export class RealtimePatternManager {
  private patterns: Map<string, RealtimePattern> = new Map();
  private subscribers: Set<(patterns: RealtimePattern[]) => void> = new Set();

  constructor() {
    this.initializeRealtimeSubscription();
  }

  private async initializeRealtimeSubscription() {
    try {
      // Subscribe to pattern changes
      const channel = supabase
        .channel('realtime-patterns')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'learned_patterns' 
          }, 
          (payload) => {
            this.handlePatternChange(payload);
          }
        )
        .subscribe();

      logger.info('Realtime pattern subscription initialized');
    } catch (error) {
      logger.error('Failed to initialize realtime subscription', { error });
    }
  }

  private handlePatternChange(payload: any) {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (newRecord) {
          const pattern: RealtimePattern = {
            id: newRecord.id,
            patterns: newRecord.patterns || {},
            metadata: newRecord.metadata || {},
            is_public: newRecord.is_public || false,
            updated_at: newRecord.updated_at || new Date().toISOString(),
            user_id: newRecord.user_id || '',
          };
          
          this.patterns.set(pattern.id, pattern);
          this.notifySubscribers();
        }
      } else if (eventType === 'DELETE' && oldRecord) {
        this.patterns.delete(oldRecord.id);
        this.notifySubscribers();
      }
    } catch (error) {
      logger.error('Error handling pattern change', { error, payload });
    }
  }

  private notifySubscribers() {
    const patternList = Array.from(this.patterns.values());
    this.subscribers.forEach(callback => {
      try {
        callback(patternList);
      } catch (error) {
        logger.error('Error notifying subscriber', { error });
      }
    });
  }

  public subscribe(callback: (patterns: RealtimePattern[]) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public async getPatterns(): Promise<RealtimePattern[]> {
    return Array.from(this.patterns.values());
  }

  public async getPattern(id: string): Promise<RealtimePattern | null> {
    return this.patterns.get(id) || null;
  }

  public async addPattern(pattern: Omit<RealtimePattern, 'id' | 'updated_at'>): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('learned_patterns')
        .insert({
          patterns: pattern.patterns,
          metadata: pattern.metadata,
          is_public: pattern.is_public,
          user_id: pattern.user_id,
        });

      if (error) {
        throw error;
      }

      logger.info('Pattern added successfully');
    } catch (error) {
      logger.error('Failed to add pattern', { error, pattern });
      throw error;
    }
  }

  public async updatePattern(id: string, updates: Partial<RealtimePattern>): Promise<void> {
    try {
      const { error } = await supabase
        .from('learned_patterns')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      logger.info('Pattern updated successfully', { id });
    } catch (error) {
      logger.error('Failed to update pattern', { error, id, updates });
      throw error;
    }
  }

  public async removePattern(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('learned_patterns')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      logger.info('Pattern removed successfully', { id });
    } catch (error) {
      logger.error('Failed to remove pattern', { error, id });
      throw error;
    }
  }
}

// Global instance
export const realtimePatternManager = new RealtimePatternManager();

// React hook for using realtime patterns
export function useRealtimePatterns() {
  const [patterns, setPatterns] = React.useState<RealtimePattern[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = realtimePatternManager.subscribe((newPatterns) => {
      setPatterns(newPatterns);
      setLoading(false);
    });

    // Initial load
    realtimePatternManager.getPatterns().then((initialPatterns) => {
      setPatterns(initialPatterns);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { patterns, loading };
}

// Component for displaying realtime patterns
export const RealtimePatternDisplay: React.FC = () => {
  const { patterns, loading } = useRealtimePatterns();

  if (loading) {
    return <div>Loading patterns...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Realtime Patterns ({patterns.length})</h3>
      {patterns.map((pattern) => (
        <div key={pattern.id} className="p-4 border rounded-lg">
          <div className="text-sm text-gray-500">ID: {pattern.id}</div>
          <div className="text-sm">Updated: {new Date(pattern.updated_at).toLocaleString()}</div>
          <div className="text-sm">Public: {pattern.is_public ? 'Yes' : 'No'}</div>
        </div>
      ))}
    </div>
  );
};
