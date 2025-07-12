
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimePattern {
  id: string;
  patterns: string[];
  metadata: Record<string, any>;
  is_public: boolean;
  updated_at: string;
  user_id: string;
}

export class RealtimePatternSync {
  private static subscribers: Set<(patterns: RealtimePattern[]) => void> = new Set();
  private static patterns: RealtimePattern[] = [];

  static async initialize() {
    try {
      const { data, error } = await supabase
        .from('learned_patterns')
        .select('*')
        .eq('is_public', true);

      if (error) throw error;

      // Type assertion to handle the database response
      const typedData = data as any[];
      
      this.patterns = typedData.map(item => ({
        id: item.id,
        patterns: item.patterns || [],
        metadata: item.metadata || {},
        is_public: item.is_public || false,
        updated_at: item.updated_at || new Date().toISOString(),
        user_id: item.user_id || '',
      }));

      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to initialize realtime patterns:', error);
    }
  }

  static subscribe(callback: (patterns: RealtimePattern[]) => void) {
    this.subscribers.add(callback);
    callback(this.patterns);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private static notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.patterns));
  }

  static async syncPattern(pattern: Omit<RealtimePattern, 'id' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('learned_patterns')
        .insert([{
          patterns: pattern.patterns,
          metadata: pattern.metadata,
          is_public: pattern.is_public,
          user_id: pattern.user_id,
        }])
        .select();

      if (error) throw error;

      await this.initialize(); // Refresh patterns
    } catch (error) {
      console.error('Failed to sync pattern:', error);
    }
  }
}

// React hook for using realtime patterns
export function useRealtimePatterns() {
  const [patterns, setPatterns] = useState<RealtimePattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = RealtimePatternSync.subscribe((newPatterns) => {
      setPatterns(newPatterns);
      setLoading(false);
    });

    RealtimePatternSync.initialize();

    return unsubscribe;
  }, []);

  return { patterns, loading };
}

// React component for pattern sharing
export const PatternSharingComponent: React.FC = () => {
  const { patterns, loading } = useRealtimePatterns();

  if (loading) {
    return <div>Loading patterns...</div>;
  }

  return (
    <div>
      <h3>Shared Patterns ({patterns.length})</h3>
      {patterns.map(pattern => (
        <div key={pattern.id}>
          <strong>Pattern {pattern.id}</strong>
          <pre>{JSON.stringify(pattern.patterns, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};
