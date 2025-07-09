import { describe, it, expect, beforeEach } from "vitest";
import { performanceBenchmarks } from "@/lib/neurolint/performance-benchmarks";
import { TestRunner } from "@/lib/neurolint/test-runner";

describe("NeuroLint Performance Tests", () => {
  let testRunner: TestRunner;

  beforeEach(() => {
    testRunner = new TestRunner();
  });

  describe("Performance Benchmarks", () => {
    it("should complete single file processing within time limit", async () => {
      const startTime = Date.now();

      const result = await performanceBenchmarks.runFullBenchmark();

      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(result.performanceResults).toBeDefined();
      expect(duration).toBeLessThan(60000); // Should complete within 1 minute
    });

    it("should maintain memory efficiency", async () => {
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

      await performanceBenchmarks.runFullBenchmark();

      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 200MB for full benchmark)
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024);
    });
  });

  describe("Load Testing", () => {
    it("should handle concurrent processing", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        testRunner.runCustomCodeTest(`const test${i} = ${i};`),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.passed).toBeDefined();
      });
    });

    it("should process large files efficiently", async () => {
      const largeCode = Array.from(
        { length: 1000 },
        (_, i) => `const variable${i} = "This is line ${i}";`,
      ).join("\n");

      const startTime = Date.now();
      const result = await testRunner.runCustomCodeTest(largeCode);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe("Memory Stress Testing", () => {
    it("should handle memory pressure gracefully", async () => {
      const iterations = 50;
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

      for (let i = 0; i < iterations; i++) {
        await testRunner.runCustomCodeTest(`
          const data${i} = new Array(1000).fill(0).map((_, j) => ({
            id: j,
            value: Math.random(),
            nested: { data: new Array(100).fill(i + j) }
          }));
        `);
      }

      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory should not grow excessively
      expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
    });
  });

  describe("Throughput Testing", () => {
    it("should maintain consistent throughput", async () => {
      const testCodes = Array.from(
        { length: 20 },
        (_, i) =>
          `const component${i} = () => items.map(item => <div key={item.id}>{item.name}</div>);`,
      );

      const startTime = Date.now();

      const promises = testCodes.map((code) =>
        testRunner.runCustomCodeTest(code),
      );
      const results = await Promise.all(promises);

      const duration = Date.now() - startTime;
      const throughput = testCodes.length / (duration / 1000); // tests per second

      expect(throughput).toBeGreaterThan(0.5); // At least 0.5 tests per second
      expect(results.filter((r) => r.passed).length).toBeGreaterThan(
        testCodes.length * 0.8,
      ); // 80% success rate
    });
  });

  describe("Edge Case Performance", () => {
    it("should handle malformed code without significant performance degradation", async () => {
      const malformedCodes = [
        "const invalid = function( { return }",
        "<div><span>Unclosed",
        'import { broken from "module"',
        "const = incomplete;",
        "function noParams( { return true; }",
      ];

      const startTime = Date.now();

      const promises = malformedCodes.map((code) =>
        testRunner
          .runCustomCodeTest(code)
          .catch(() => ({ passed: false, layerResults: [] })),
      );

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should handle all within 5 seconds
      expect(results).toHaveLength(malformedCodes.length);
    });

    it("should handle very large files", async () => {
      const largeCode = Array.from(
        { length: 10000 },
        (_, i) =>
          `const line${i} = "This is a very long line of code that should test memory and processing efficiency ${i}";`,
      ).join("\n");

      const startTime = Date.now();
      const result = await testRunner.runCustomCodeTest(largeCode);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });
  });

  describe("Sustained Performance", () => {
    it("should maintain performance over extended periods", async () => {
      const testDuration = 10000; // 10 seconds
      const endTime = Date.now() + testDuration;

      let processedCount = 0;
      let errorCount = 0;
      const durations: number[] = [];

      while (Date.now() < endTime) {
        const startTime = Date.now();

        try {
          const result = await testRunner.runCustomCodeTest(`
            const sustained${processedCount} = () => {
              return items.map(item => <div key={item.id}>{item.name}</div>);
            };
          `);

          if (result.passed) {
            processedCount++;
          } else {
            errorCount++;
          }

          const duration = Date.now() - startTime;
          durations.push(duration);
        } catch {
          errorCount++;
        }

        // Small delay to prevent overwhelming
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const averageDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;
      const errorRate = errorCount / (processedCount + errorCount);

      expect(processedCount).toBeGreaterThan(10); // Should process at least 10 items
      expect(errorRate).toBeLessThan(0.1); // Less than 10% error rate
      expect(averageDuration).toBeLessThan(1000); // Average less than 1 second per test
    });
  });
});
