import {
  PipelineState,
  PipelineResult,
  LayerMetadata,
  ExecutionOptions,
  ErrorInfo,
} from "./types";

/**
 * Comprehensive pipeline tracking system
 * Maintains complete state history for debugging and rollback
 */
export class TransformationPipeline {
  private states: PipelineState[] = [];
  private metadata: LayerMetadata[] = [];

  constructor(private initialCode: string) {
    this.states.push({
      currentLayer: 0,
      completed: false,
      errors: [],
      step: 0,
      layerId: null,
      code: initialCode,
      timestamp: Date.now(),
      description: "Initial state",
    });
  }

  /**
   * Execute complete pipeline with full state tracking
   */
  async execute(
    layers: number[],
    options: ExecutionOptions = { verbose: false, dryRun: false },
  ): Promise<PipelineResult> {
    let current = this.initialCode;
    const results: any[] = [];

    for (let i = 0; i < layers.length; i++) {
      const layerId = layers[i];
      const startTime = performance.now();
      const previous = current;

      try {
        // Execute layer transformation
        current = await this.executeLayer(layerId, current, options);

        // Record successful state
        this.recordState({
          currentLayer: layerId,
          completed: false,
          errors: [],
          step: i + 1,
          layerId,
          code: current,
          timestamp: Date.now(),
          description: `After Layer ${layerId}`,
          success: true,
          executionTime: performance.now() - startTime,
          changeCount: this.calculateChanges(previous, current),
        });

        results.push({
          layerId,
          success: true,
          executionTime: performance.now() - startTime,
          changeCount: this.calculateChanges(previous, current),
        });

        if (options.verbose) {
          console.log(`✅ Layer ${layerId} completed successfully`);
        }
      } catch (error) {
        // Record failed state (keep previous code)
        this.recordState({
          currentLayer: layerId,
          completed: false,
          errors: [{
            code: 'LAYER_EXECUTION_FAILED',
            message: (error as Error).message,
            layer: layerId,
            severity: 'high' as const
          }],
          step: i + 1,
          layerId,
          code: previous, // Keep previous safe state
          timestamp: Date.now(),
          description: `Layer ${layerId} failed`,
          success: false,
          executionTime: performance.now() - startTime,
        });

        results.push({
          layerId,
          success: false,
          error: (error as Error).message,
          executionTime: performance.now() - startTime,
          changeCount: 0,
        });

        console.error(`❌ Layer ${layerId} failed:`, (error as Error).message);

        // Continue with previous code
        current = previous;
      }
    }

    return this.generateResult(current, results);
  }

  /**
   * Record state at each pipeline step
   */
  private recordState(state: PipelineState): void {
    this.states.push(state);

    if (state.layerId) {
      this.metadata.push({
        id: state.layerId,
        name: `Layer ${state.layerId}`,
        version: "1.0.0",
        dependencies: [],
        layerId: state.layerId,
        success: state.success || false,
        executionTime: state.executionTime || 0,
        changeCount: state.changeCount || 0,
        error: state.errors?.[0]?.message,
        improvements: state.success ? this.detectImprovements(state) : [],
      });
    }
  }

  /**
   * Get state at specific step for debugging
   */
  getStateAt(step: number): PipelineState | null {
    return this.states[step] || null;
  }

  /**
   * Rollback to specific step
   */
  rollbackTo(step: number): string {
    const state = this.getStateAt(step);
    if (!state) {
      throw new Error(`Invalid step: ${step}`);
    }

    console.log(`🔄 Rolling back to step ${step}: ${state.description}`);
    return state.code || '';
  }

  /**
   * Generate comprehensive pipeline result
   */
  private generateResult(finalCode: string, results: any[]): PipelineResult {
    return {
      success: results.some(r => r.success),
      results,
      totalTime: this.metadata.reduce((sum, m) => sum + m.executionTime, 0),
      finalCode,
      states: this.states,
      metadata: this.metadata,
      summary: {
        totalSteps: this.states.length - 1,
        successfulLayers: this.metadata.filter((m) => m.success).length,
        failedLayers: this.metadata.filter((m) => !m.success).length,
        totalExecutionTime: this.metadata.reduce(
          (sum, m) => sum + m.executionTime,
          0,
        ),
        totalChanges: this.metadata.reduce((sum, m) => sum + m.changeCount, 0),
      },
    };
  }

  private calculateChanges(before: string, after: string): number {
    const beforeLines = before.split("\n");
    const afterLines = after.split("\n");
    let changes = Math.abs(beforeLines.length - afterLines.length);

    const minLength = Math.min(beforeLines.length, afterLines.length);
    for (let i = 0; i < minLength; i++) {
      if (beforeLines[i] !== afterLines[i]) changes++;
    }

    return changes;
  }

  private detectImprovements(state: PipelineState): string[] {
    return ["Transformation applied successfully"];
  }

  private async executeLayer(
    layerId: number,
    code: string,
    options: ExecutionOptions,
  ): Promise<string> {
    // Delegate to the orchestrator's executeLayer method
    const { NeuroLintOrchestrator } = await import("./orchestrator");
    return NeuroLintOrchestrator.executeLayer(layerId, code, options);
  }
}
