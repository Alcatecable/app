/**
 * Pattern Storage Service
 * Provides robust persistence for learned patterns with multiple storage strategies
 */

import { LearnedPattern } from './types';
import { logger } from './logger';

export interface PatternStorageAdapter {
  save(patterns: LearnedPattern[]): Promise<boolean>;
  load(): Promise<LearnedPattern[]>;
  clear(): Promise<boolean>;
}

/**
 * Local Storage Adapter (fallback)
 */
class LocalStorageAdapter implements PatternStorageAdapter {
  private readonly STORAGE_KEY = 'neurolint_learned_patterns_v2';
  private readonly MAX_PATTERNS = 1000;

  async save(patterns: LearnedPattern[]): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      
             // Sort by confidence and usage, keep only top patterns
       const sortedPatterns = patterns
         .sort((a, b) => (b.confidence * b.usage) - (a.confidence * a.usage))
         .slice(0, this.MAX_PATTERNS);

      const data = {
        patterns: sortedPatterns,
        timestamp: Date.now(),
        version: '2.0'
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      logger.error('Failed to save patterns to localStorage', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  async load(): Promise<LearnedPattern[]> {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const data = JSON.parse(stored);
      
      // Validate data structure
      if (data.version !== '2.0' || !Array.isArray(data.patterns)) {
        logger.warn('Invalid pattern data format, clearing storage');
        await this.clear();
        return [];
      }

      // Filter out low-usage patterns (keep patterns with usage > 1)
      const validPatterns = data.patterns.filter((pattern: LearnedPattern) => 
        pattern.usage > 1 && pattern.confidence > 0.3
      );

      return validPatterns;
    } catch (error) {
      logger.error('Failed to load patterns from localStorage', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async clear(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      logger.error('Failed to clear localStorage patterns', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
}

/**
 * API Storage Adapter (primary)
 */
class APIStorageAdapter implements PatternStorageAdapter {
  private readonly API_BASE = 'https://api.neurolint.dev';

  async save(patterns: LearnedPattern[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/api/v1/patterns/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          patterns,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API save failed: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      logger.error('Failed to save patterns to API', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  async load(): Promise<LearnedPattern[]> {
    try {
      const response = await fetch(`${this.API_BASE}/api/v1/patterns/load`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API load failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.patterns || [];
    } catch (error) {
      logger.error('Failed to load patterns from API', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async clear(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/api/v1/patterns/clear`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      logger.error('Failed to clear patterns via API', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
}

/**
 * Pattern Storage Service with multiple adapters and fallback strategy
 */
export class PatternStorageService {
  private primaryAdapter: PatternStorageAdapter;
  private fallbackAdapter: PatternStorageAdapter;

  constructor() {
    this.primaryAdapter = new APIStorageAdapter();
    this.fallbackAdapter = new LocalStorageAdapter();
  }

  /**
   * Save patterns with primary adapter, fallback to secondary on failure
   */
  async savePatterns(patterns: LearnedPattern[]): Promise<boolean> {
    logger.info('Saving learned patterns', {
      layerId: 7,
      metadata: { patternCount: patterns.length }
    });

    try {
      // Try primary adapter (API)
      const primaryResult = await this.primaryAdapter.save(patterns);
      if (primaryResult) {
        logger.info('Patterns saved successfully to API', {
          layerId: 7,
          metadata: { patternCount: patterns.length }
        });
        return true;
      }
    } catch (error) {
      logger.warn('Primary storage failed, trying fallback', {
        layerId: 7,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    // Fallback to localStorage
    try {
      const fallbackResult = await this.fallbackAdapter.save(patterns);
      if (fallbackResult) {
        logger.info('Patterns saved to localStorage fallback', {
          layerId: 7,
          metadata: { patternCount: patterns.length }
        });
        return true;
      }
    } catch (error) {
      logger.error('All storage adapters failed', error instanceof Error ? error : new Error(String(error)));
    }

    return false;
  }

  /**
   * Load patterns, trying primary first, then fallback
   */
  async loadPatterns(): Promise<LearnedPattern[]> {
    logger.info('Loading learned patterns', {
      layerId: 7,
      metadata: {}
    });

    try {
      // Try primary adapter (API)
      const patterns = await this.primaryAdapter.load();
      if (patterns.length > 0) {
        logger.info('Patterns loaded from API', {
          layerId: 7,
          metadata: { patternCount: patterns.length }
        });
        return patterns;
      }
    } catch (error) {
      logger.warn('Primary storage load failed, trying fallback', {
        layerId: 7,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    // Fallback to localStorage
    try {
      const patterns = await this.fallbackAdapter.load();
      logger.info('Patterns loaded from localStorage fallback', {
        layerId: 7,
        metadata: { patternCount: patterns.length }
      });
      return patterns;
    } catch (error) {
      logger.error('All storage adapters failed to load', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Clear all stored patterns
   */
  async clearPatterns(): Promise<boolean> {
    logger.info('Clearing all learned patterns', {
      layerId: 7,
      metadata: {}
    });

    let anySuccess = false;

    // Clear from both adapters
    try {
      const primaryResult = await this.primaryAdapter.clear();
      if (primaryResult) anySuccess = true;
    } catch (error) {
      logger.warn('Failed to clear primary storage', {
        layerId: 7,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    try {
      const fallbackResult = await this.fallbackAdapter.clear();
      if (fallbackResult) anySuccess = true;
    } catch (error) {
      logger.warn('Failed to clear fallback storage', {
        layerId: 7,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    if (anySuccess) {
      logger.info('Patterns cleared successfully', {
        layerId: 7,
        metadata: {}
      });
    }

    return anySuccess;
  }

  /**
   * Get storage statistics
   */
  async getStorageInfo(): Promise<{
    primaryAvailable: boolean;
    fallbackAvailable: boolean;
    estimatedSize: number;
  }> {
    const patterns = await this.loadPatterns();
    const estimatedSize = JSON.stringify(patterns).length;

    return {
      primaryAvailable: true, // API should always be available
      fallbackAvailable: typeof window !== 'undefined' && !!window.localStorage,
      estimatedSize
    };
  }
}

// Export singleton instance
export const patternStorage = new PatternStorageService();