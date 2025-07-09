import { NeuroLintOrchestrator } from "./orchestrator";
import { MetricsCollector } from "./metrics";

export interface BenchmarkResult {
  name: string;
  score: number;
  maxScore: number;
  duration: number;
  memoryUsage: number;
  throughput: number;
  accuracy: number;
}

export interface PerformanceSuite {
  metrics: {
    totalDuration: number;
    memoryUsage: number;
    throughput: number;
    accuracy: number;
  };
  benchmarks: BenchmarkResult[];
}

export class PerformanceBenchmarks {
  private orchestrator: NeuroLintOrchestrator;
  private metrics: MetricsCollector;

  constructor() {
    this.orchestrator = new NeuroLintOrchestrator();
    this.metrics = new MetricsCollector();
  }

  async runFullBenchmark(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; performanceResults: PerformanceSuite }> {
    const benchmarks: BenchmarkResult[] = [];
    let totalDuration = 0;
    let totalMemoryUsage = 0;
    let totalThroughput = 0;
    let totalAccuracy = 0;

    const benchmarkTests = [
      { name: "Single File Processing", test: this.benchmarkSingleFile },
      { name: "Small Component Analysis", test: this.benchmarkSmallComponent },
      {
        name: "Medium Codebase Processing",
        test: this.benchmarkMediumCodebase,
      },
      { name: "Complex Component Tree", test: this.benchmarkComplexComponent },
      {
        name: "Pattern Recognition Speed",
        test: this.benchmarkPatternRecognition,
      },
      { name: "AST Parsing Performance", test: this.benchmarkASTPerformance },
      {
        name: "Layer Orchestration Overhead",
        test: this.benchmarkOrchestrationOverhead,
      },
      {
        name: "Concurrent Processing",
        test: this.benchmarkConcurrentProcessing,
      },
      { name: "Memory Efficiency", test: this.benchmarkMemoryEfficiency },
      { name: "Error Recovery Speed", test: this.benchmarkErrorRecovery },
    ];

    for (let i = 0; i < benchmarkTests.length; i++) {
      const benchmark = benchmarkTests[i];
      progressCallback?.(
        ((i + 1) / benchmarkTests.length) * 100,
        `Running ${benchmark.name}...`,
      );

      try {
        const result = await benchmark.test.call(this);
        benchmarks.push(result);

        totalDuration += result.duration;
        totalMemoryUsage = Math.max(totalMemoryUsage, result.memoryUsage);
        totalThroughput += result.throughput;
        totalAccuracy += result.accuracy;
      } catch (error) {
        console.error(`Benchmark ${benchmark.name} failed:`, error);
        benchmarks.push({
          name: benchmark.name,
          score: 0,
          maxScore: 100,
          duration: 0,
          memoryUsage: 0,
          throughput: 0,
          accuracy: 0,
        });
      }
    }

    const averageAccuracy = totalAccuracy / benchmarkTests.length;
    const averageThroughput = totalThroughput / benchmarkTests.length;

    const performanceResults: PerformanceSuite = {
      metrics: {
        totalDuration,
        memoryUsage: totalMemoryUsage,
        throughput: averageThroughput,
        accuracy: averageAccuracy,
      },
      benchmarks,
    };

    const passed = averageAccuracy >= 90 && totalDuration < 30000; // 90% accuracy, under 30s

    return { passed, performanceResults };
  }

  private async benchmarkSingleFile(): Promise<BenchmarkResult> {
    const testCode = `
      const MyComponent = ({ items }) => {
        return (
          <div>
            {items.map(item => <div>{item.name}</div>)}
          </div>
        );
      };
    `;

    const startTime = Date.now();
    const startMemory = this.getCurrentMemoryUsage();

    const result = await this.orchestrator.processCode(testCode, {
      selectedLayers: [1, 2, 3, 4, 5, 6, 7],
    });

    const endTime = Date.now();
    const endMemory = this.getCurrentMemoryUsage();

    const duration = endTime - startTime;
    const memoryUsage = endMemory - startMemory;
    const throughput = testCode.length / (duration / 1000); // chars per second
    const accuracy = result.success ? 100 : 0;

    return {
      name: "Single File Processing",
      score: Math.max(0, 100 - duration / 10), // Score decreases with time
      maxScore: 100,
      duration,
      memoryUsage,
      throughput,
      accuracy,
    };
  }

  private async benchmarkSmallComponent(): Promise<BenchmarkResult> {
    const testCode = `
      import React, { useState } from 'react';

      const Counter = () => {
        const [count, setCount] = useState(0);

        return (
          <div>
            <h1>Count: {count}</h1>
            <button onClick={() => setCount(count + 1)}>
              Increment
            </button>
          </div>
        );
      };

      export default Counter;
    `;

    return this.runBenchmarkTest("Small Component Analysis", testCode, 500);
  }

  private async benchmarkMediumCodebase(): Promise<BenchmarkResult> {
    const testCode = this.generateMediumCodebase();
    return this.runBenchmarkTest("Medium Codebase Processing", testCode, 2000);
  }

  private async benchmarkComplexComponent(): Promise<BenchmarkResult> {
    const testCode = this.generateComplexComponent();
    return this.runBenchmarkTest("Complex Component Tree", testCode, 1500);
  }

  private async benchmarkPatternRecognition(): Promise<BenchmarkResult> {
    const testCode = `
      const items = [1, 2, 3, 4, 5];

      // Various patterns to recognize
      const mapped1 = items.map(item => <div>{item}</div>);
      const mapped2 = items.map((item, index) => <span>{index}: {item}</span>);
      const mapped3 = items.map(item => <Component item={item} />);
      const mapped4 = items.map(item => {
        return <div className="item">{item}</div>;
      });
    `;

    const startTime = Date.now();
    const result = await this.orchestrator.processCode(testCode, {
      selectedLayers: [2, 3], // Focus on pattern recognition layers
    });
    const duration = Date.now() - startTime;

    // Count how many patterns were correctly identified
    const expectedPatterns = 4;
    const foundPatterns = result.changes?.length || 0;
    const accuracy = (foundPatterns / expectedPatterns) * 100;

    return {
      name: "Pattern Recognition Speed",
      score: Math.max(0, 100 - duration / 5), // Score based on speed
      maxScore: 100,
      duration,
      memoryUsage: this.getCurrentMemoryUsage(),
      throughput: testCode.length / (duration / 1000),
      accuracy,
    };
  }

  private async benchmarkASTPerformance(): Promise<BenchmarkResult> {
    const testCode = this.generateComplexAST();

    const startTime = Date.now();
    const startMemory = this.getCurrentMemoryUsage();

    // Run multiple times to test AST parsing consistency
    const iterations = 10;
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const result = await this.orchestrator.processCode(testCode, {
          selectedLayers: [3, 4], // AST-heavy layers
        });
        if (result.success) successCount++;
      } catch {
        // Count failures
      }
    }

    const endTime = Date.now();
    const endMemory = this.getCurrentMemoryUsage();

    const duration = endTime - startTime;
    const averageDuration = duration / iterations;
    const accuracy = (successCount / iterations) * 100;

    return {
      name: "AST Parsing Performance",
      score: Math.max(0, 100 - averageDuration / 10),
      maxScore: 100,
      duration: averageDuration,
      memoryUsage: endMemory - startMemory,
      throughput: (testCode.length * iterations) / (duration / 1000),
      accuracy,
    };
  }

  private async benchmarkOrchestrationOverhead(): Promise<BenchmarkResult> {
    const testCode = "const simple = true;";

    // Benchmark with orchestration
    const startTimeOrchestrated = Date.now();
    await this.orchestrator.processCode(testCode, {
      selectedLayers: [1, 2, 3, 4, 5, 6, 7],
    });
    const orchestratedDuration = Date.now() - startTimeOrchestrated;

    // Benchmark single layer (minimal orchestration)
    const startTimeSingle = Date.now();
    await this.orchestrator.processCode(testCode, {
      selectedLayers: [1],
    });
    const singleDuration = Date.now() - startTimeSingle;

    const overhead = orchestratedDuration - singleDuration * 7;
    const efficiency = Math.max(
      0,
      100 - (overhead / orchestratedDuration) * 100,
    );

    return {
      name: "Layer Orchestration Overhead",
      score: efficiency,
      maxScore: 100,
      duration: orchestratedDuration,
      memoryUsage: this.getCurrentMemoryUsage(),
      throughput: testCode.length / (orchestratedDuration / 1000),
      accuracy: efficiency,
    };
  }

  private async benchmarkConcurrentProcessing(): Promise<BenchmarkResult> {
    const testCodes = Array.from(
      { length: 20 },
      (_, i) =>
        `const concurrent${i} = ${i}; const items${i} = [].map(item => <div key={item.id}>{item.name}</div>);`,
    );

    const startTime = Date.now();
    const startMemory = this.getCurrentMemoryUsage();

    const promises = testCodes.map((code) =>
      this.orchestrator.processCode(code, { selectedLayers: [1, 2, 3] }),
    );

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const endMemory = this.getCurrentMemoryUsage();

    const duration = endTime - startTime;
    const successCount = results.filter((r) => r.success).length;
    const accuracy = (successCount / testCodes.length) * 100;

    return {
      name: "Concurrent Processing",
      score: Math.max(0, 100 - duration / 100), // Expect fast concurrent processing
      maxScore: 100,
      duration,
      memoryUsage: endMemory - startMemory,
      throughput:
        testCodes.reduce((acc, code) => acc + code.length, 0) /
        (duration / 1000),
      accuracy,
    };
  }

  private async benchmarkMemoryEfficiency(): Promise<BenchmarkResult> {
    const startMemory = this.getCurrentMemoryUsage();
    const largeCode = this.generateLargeCodeForMemoryTest();

    const startTime = Date.now();
    const result = await this.orchestrator.processCode(largeCode, {
      selectedLayers: [1, 2, 3, 4, 5, 6, 7],
    });
    const duration = Date.now() - startTime;

    const endMemory = this.getCurrentMemoryUsage();
    const memoryUsed = endMemory - startMemory;

    // Good memory efficiency: less than 2MB per 10KB of code
    const efficiency = Math.max(
      0,
      100 - (memoryUsed / (largeCode.length / 1024)) * 10,
    );

    return {
      name: "Memory Efficiency",
      score: efficiency,
      maxScore: 100,
      duration,
      memoryUsage: memoryUsed,
      throughput: largeCode.length / (duration / 1000),
      accuracy: result.success ? 100 : 0,
    };
  }

  private async benchmarkErrorRecovery(): Promise<BenchmarkResult> {
    const invalidCodes = [
      "const invalid = function( { return }",
      "<div><span>Unclosed",
      'import { broken from "module"',
      "const = incomplete;",
      "function noParams( { return true; }",
    ];

    const startTime = Date.now();
    let recoveredCount = 0;

    for (const code of invalidCodes) {
      try {
        const result = await this.orchestrator.processCode(code, {});
        // Recovery is successful if it doesn't crash and returns a result
        if (result) recoveredCount++;
      } catch {
        // Failed to recover
      }
    }

    const duration = Date.now() - startTime;
    const recoveryRate = (recoveredCount / invalidCodes.length) * 100;

    return {
      name: "Error Recovery Speed",
      score: Math.min(recoveryRate, 100 - duration / 10),
      maxScore: 100,
      duration,
      memoryUsage: this.getCurrentMemoryUsage(),
      throughput:
        invalidCodes.reduce((acc, code) => acc + code.length, 0) /
        (duration / 1000),
      accuracy: recoveryRate,
    };
  }

  private async runBenchmarkTest(
    name: string,
    code: string,
    maxExpectedDuration: number,
  ): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const startMemory = this.getCurrentMemoryUsage();

    const result = await this.orchestrator.processCode(code, {
      selectedLayers: [1, 2, 3, 4, 5, 6, 7],
    });

    const endTime = Date.now();
    const endMemory = this.getCurrentMemoryUsage();

    const duration = endTime - startTime;
    const memoryUsage = endMemory - startMemory;
    const throughput = code.length / (duration / 1000);
    const accuracy = result.success ? 100 : 0;

    // Score based on how well it performed vs expectations
    const timeScore = Math.max(0, 100 - (duration / maxExpectedDuration) * 100);
    const memoryScore = Math.max(0, 100 - (memoryUsage / (1024 * 1024)) * 10); // Penalty for > 10MB
    const score = (timeScore + memoryScore + accuracy) / 3;

    return {
      name,
      score,
      maxScore: 100,
      duration,
      memoryUsage,
      throughput,
      accuracy,
    };
  }

  private getCurrentMemoryUsage(): number {
    if (typeof process !== "undefined" && process.memoryUsage) {
      try {
        return process.memoryUsage().heapUsed;
      } catch {
        // Fallback if memoryUsage fails
      }
    }

    // Browser fallback - use performance.memory if available
    if (typeof performance !== "undefined" && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }

    // Final fallback - estimate based on timestamp for demo
    return Math.floor(Date.now() % (50 * 1024 * 1024)); // Simulate 0-50MB
  }

  private generateMediumCodebase(): string {
    return `
      import React, { useState, useEffect, useCallback } from 'react';
      import { Button } from './components/Button';
      import { Modal } from './components/Modal';

      interface User {
        id: number;
        name: string;
        email: string;
        role: string;
      }

      const UserManagement: React.FC = () => {
        const [users, setUsers] = useState<User[]>([]);
        const [selectedUser, setSelectedUser] = useState<User | null>(null);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
          fetchUsers();
        }, []);

        const fetchUsers = useCallback(async () => {
          setLoading(true);
          try {
            const response = await fetch('/api/users');
            const userData = await response.json();
            setUsers(userData);
          } catch (error) {
            console.error('Failed to fetch users:', error);
          } finally {
            setLoading(false);
          }
        }, []);

        const handleUserSelect = useCallback((user: User) => {
          setSelectedUser(user);
          setIsModalOpen(true);
        }, []);

        const handleCloseModal = useCallback(() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }, []);

        if (loading) {
          return <div>Loading users...</div>;
        }

        return (
          <div className="user-management">
            <h1>User Management</h1>
            <div className="user-list">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <p>Role: {user.role}</p>
                  <Button onClick={() => handleUserSelect(user)}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>

            {isModalOpen && selectedUser && (
              <Modal onClose={handleCloseModal}>
                <h2>User Details</h2>
                <p>Name: {selectedUser.name}</p>
                <p>Email: {selectedUser.email}</p>
                <p>Role: {selectedUser.role}</p>
              </Modal>
            )}
          </div>
        );
      };

      export default UserManagement;
    `;
  }

  private generateComplexComponent(): string {
    return `
      import React, { useState, useEffect, useMemo, useCallback } from 'react';

      const ComplexDashboard = ({ data, config, onUpdate }) => {
        const [filters, setFilters] = useState({});
        const [sortBy, setSortBy] = useState('name');
        const [sortOrder, setSortOrder] = useState('asc');
        const [selectedItems, setSelectedItems] = useState([]);

        const filteredData = useMemo(() => {
          return data.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
              return !value || item[key]?.toString().toLowerCase().includes(value.toLowerCase());
            });
          });
        }, [data, filters]);

        const sortedData = useMemo(() => {
          return [...filteredData].sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            const multiplier = sortOrder === 'asc' ? 1 : -1;
            return aVal < bVal ? -1 * multiplier : aVal > bVal ? 1 * multiplier : 0;
          });
        }, [filteredData, sortBy, sortOrder]);

        const handleFilterChange = useCallback((key, value) => {
          setFilters(prev => ({ ...prev, [key]: value }));
        }, []);

        const handleSort = useCallback((field) => {
          if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(field);
            setSortOrder('asc');
          }
        }, [sortBy]);

        const handleSelection = useCallback((item, isSelected) => {
          setSelectedItems(prev => {
            if (isSelected) {
              return [...prev, item.id];
            } else {
              return prev.filter(id => id !== item.id);
            }
          });
        }, []);

        return (
          <div className="complex-dashboard">
            <div className="dashboard-header">
              <h1>Complex Dashboard</h1>
              <div className="controls">
                {config.filters.map(filter => (
                  <div key={filter.key} className="filter-control">
                    <label>{filter.label}</label>
                    <input
                      type="text"
                      value={filters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={\`Filter by \${filter.label}\`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-content">
              <div className="data-table">
                <div className="table-header">
                  {config.columns.map(column => (
                    <div
                      key={column.key}
                      className="column-header"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      {sortBy === column.key && (
                        <span className="sort-indicator">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="table-body">
                  {sortedData.map(item => (
                    <div key={item.id} className="table-row">
                      <div className="row-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleSelection(item, e.target.checked)}
                        />
                      </div>
                      {config.columns.map(column => (
                        <div key={column.key} className="table-cell">
                          {column.render ? column.render(item[column.key], item) : item[column.key]}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-summary">
                <p>Total Items: {data.length}</p>
                <p>Filtered Items: {filteredData.length}</p>
                <p>Selected Items: {selectedItems.length}</p>
              </div>
            </div>
          </div>
        );
      };
    `;
  }

  private generateComplexAST(): string {
    return `
      const deeplyNested = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  data: [1, 2, 3, 4, 5].map(item => ({
                    id: item,
                    nested: {
                      deep: {
                        values: Array.from({ length: item }, (_, i) => ({
                          index: i,
                          computed: item * i,
                          callback: () => item + i
                        }))
                      }
                    }
                  }))
                }
              }
            }
          }
        }
      };

      const complexFunction = (a, b, c) => {
        return {
          ...a,
          b: {
            ...b,
            modified: true,
            nested: b.values?.map?.(val => ({
              ...val,
              transformed: val.data?.filter?.(d => d.active)?.map?.(d => ({
                ...d,
                processed: d.value * 2
              })) || []
            })) || []
          },
          c: c.reduce((acc, item, index) => ({
            ...acc,
            [item.key]: {
              ...item,
              index,
              dependencies: item.deps?.map?.(dep => ({
                ...dep,
                resolved: dep.path?.split?.('/')?.pop?.() || 'unknown'
              })) || []
            }
          }), {})
        };
      };
    `;
  }

  private generateLargeCodeForMemoryTest(): string {
    const baseCode = `
      const Component = ({ items }) => {
        return (
          <div>
            {items.map(item => (
              <div key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        );
      };
    `;

    // Repeat the base code to create a large file
    return Array.from({ length: 100 }, (_, i) =>
      baseCode.replace(/Component/g, `Component${i}`),
    ).join("\n\n");
  }
}

export const performanceBenchmarks = new PerformanceBenchmarks();
