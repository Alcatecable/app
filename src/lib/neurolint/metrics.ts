/**
 * Enterprise metrics collection for NeuroLint
 * Tracks performance, success rates, and usage patterns
 */
import { logger } from "./logger";

export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  layerMetrics: Record<number, LayerMetrics>;
  errorRates: Record<string, number>;
}

export interface LayerMetrics {
  executions: number;
  successes: number;
  failures: number;
  averageTime: number;
  totalChanges: number;
}

class NeuroLintMetrics {
  private metrics: MetricData[] = [];
  private counters = new Map<string, number>();
  private timers = new Map<string, number>();

  // Counter operations
  increment(name: string, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);

    this.recordMetric({
      name,
      value: current + 1,
      timestamp: Date.now(),
      tags,
    });
  }

  // Timer operations
  startTimer(name: string): string {
    const timerId = `${name}_${Date.now()}_${Math.random()}`;
    this.timers.set(timerId, Date.now());
    return timerId;
  }

  endTimer(timerId: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      logger.warn("Timer not found", { metadata: { timerId } });
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(timerId);

    const name = timerId.split("_")[0];
    this.recordMetric({
      name: `${name}_duration`,
      value: duration,
      timestamp: Date.now(),
      tags,
    });

    return duration;
  }

  // Gauge operations
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      tags,
    });
  }

  // Layer-specific metrics
  recordLayerExecution(
    layerId: number,
    success: boolean,
    duration: number,
    changes: number,
  ): void {
    const tags = { layerId: layerId.toString(), success: success.toString() };

    this.increment("layer_executions", tags);
    this.gauge("layer_duration", duration, tags);
    this.gauge("layer_changes", changes, tags);

    if (success) {
      this.increment("layer_successes", { layerId: layerId.toString() });
    } else {
      this.increment("layer_failures", { layerId: layerId.toString() });
    }
  }

  // Pipeline metrics
  recordPipelineExecution(
    layers: number[],
    totalDuration: number,
    successfulLayers: number,
    totalChanges: number,
  ): void {
    this.increment("pipeline_executions");
    this.gauge("pipeline_duration", totalDuration);
    this.gauge("pipeline_layers", layers.length);
    this.gauge("pipeline_successful_layers", successfulLayers);
    this.gauge("pipeline_total_changes", totalChanges);
    this.gauge("pipeline_success_rate", successfulLayers / layers.length);
  }

  // Error tracking
  recordError(category: string, layerId?: number): void {
    const tags: Record<string, string> = { category };
    if (layerId) {
      tags.layerId = layerId.toString();
    }

    this.increment("errors", tags);
  }

  // Pattern learning metrics
  recordPatternLearning(patternCount: number, duration: number): void {
    this.gauge("pattern_learning_patterns", patternCount);
    this.gauge("pattern_learning_duration", duration);
    this.increment("pattern_learning_sessions");
  }

  recordPatternApplication(ruleCount: number, duration: number): void {
    this.gauge("pattern_application_rules", ruleCount);
    this.gauge("pattern_application_duration", duration);
    this.increment("pattern_application_sessions");
  }

  // Get aggregated metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const layerMetrics: Record<number, LayerMetrics> = {};

    // Aggregate layer metrics
    for (const [key, value] of this.counters.entries()) {
      if (key.includes("layer_executions")) {
        const layerId = this.extractLayerId(key);
        if (layerId !== null) {
          if (!layerMetrics[layerId]) {
            layerMetrics[layerId] = {
              executions: 0,
              successes: 0,
              failures: 0,
              averageTime: 0,
              totalChanges: 0,
            };
          }
          layerMetrics[layerId].executions = value;
        }
      }
    }

    // Calculate success/failure rates
    for (const layerId in layerMetrics) {
      const id = parseInt(layerId);
      const successKey = this.getMetricKey("layer_successes", { layerId });
      const failureKey = this.getMetricKey("layer_failures", { layerId });

      layerMetrics[id].successes = this.counters.get(successKey) || 0;
      layerMetrics[id].failures = this.counters.get(failureKey) || 0;
    }

    const totalExecutions = this.counters.get("pipeline_executions") || 0;
    const avgDuration = this.getAverageMetric("pipeline_duration");

    return {
      totalExecutions,
      successfulExecutions: totalExecutions, // Simplified for now
      failedExecutions: 0,
      averageExecutionTime: avgDuration,
      layerMetrics,
      errorRates: this.getErrorRates(),
    };
  }

  private recordMetric(metric: MetricData): void {
    this.metrics.push(metric);

    // Keep only last 10000 metrics to prevent memory issues
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  private getMetricKey(name: string, tags?: Record<string, string>): string {
    if (!tags) return name;
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(",");
    return `${name}{${tagString}}`;
  }

  private extractLayerId(key: string): number | null {
    const match = key.match(/layerId:(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  private getAverageMetric(name: string): number {
    const values = this.metrics
      .filter((m) => m.name === name)
      .map((m) => m.value);

    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private getErrorRates(): Record<string, number> {
    const errorRates: Record<string, number> = {};

    for (const [key, value] of this.counters.entries()) {
      if (key.includes("errors")) {
        const categoryMatch = key.match(/category:([^,}]+)/);
        if (categoryMatch) {
          errorRates[categoryMatch[1]] = value;
        }
      }
    }

    return errorRates;
  }

  // Export methods
  exportMetrics(): MetricData[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
    this.counters.clear();
    this.timers.clear();
  }
}

export const metrics = new NeuroLintMetrics();
