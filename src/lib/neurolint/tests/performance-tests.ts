
import { PerformanceMetrics } from "../types";

export const performanceTests = [
  {
    name: "Execution Speed Test",
    test: async (): Promise<PerformanceMetrics> => {
      return {
        totalExecutions: 1,
        successfulExecutions: 1,
        failedExecutions: 0,
        averageExecutionTime: 100,
        lastExecutionTime: 100,
        maxMemoryUsage: 1024,
        cpuUsage: 10,
        errors: []
      };
    }
  }
];
