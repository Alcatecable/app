import { TestResult } from "./types";
import { NeuroLintOrchestrator } from "./orchestrator";

export class PerformanceBenchmarks {
  private sampleCodes: string[] = [
    `
    function add(a, b) {
      return a + b;
    }
    console.log(add(5, 3));
    `,
    `
    const numbers = [1, 2, 3, 4, 5];
    const doubled = numbers.map(num => num * 2);
    console.log(doubled);
    `,
    `
    class Greeter {
      constructor(name) {
        this.name = name;
      }
      greet() {
        return "Hello, " + this.name;
      }
    }
    const greeter = new Greeter("World");
    console.log(greeter.greet());
    `,
  ];

  private async runSingleTest(): Promise<TestResult> {
    const startTime = performance.now();
    
    // Simulate a simple test
    const passed = true;
    const duration = performance.now() - startTime;
    
    return {
      name: 'Simple Test',
      passed,
      success: passed,
      duration,
      executionTime: duration,
    };
  }

  private async runAsyncTest(): Promise<TestResult> {
    const startTime = performance.now();
    
    // Simulate an asynchronous operation
    await new Promise(resolve => setTimeout(resolve, 100));
    const passed = true;
    const duration = performance.now() - startTime;
    
    return {
      name: 'Async Test',
      passed,
      success: passed,
      duration,
      executionTime: duration,
    };
  }

  private getComplexTestCode(): string {
    return `
      import React, { useState, useEffect } from 'react';

      function ComplexComponent() {
        const [data, setData] = useState([]);

        useEffect(() => {
          fetch('/api/data')
            .then(response => response.json())
            .then(data => setData(data));
        }, []);

        return (
          <ul>
            {data.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        );
      }

      export default ComplexComponent;
    `;
  }

  private async runSingleCodeTest(code: string): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      const result = await NeuroLintOrchestrator.processCode(code);
      const executionTime = performance.now() - startTime;
      
      return {
        name: 'Code Processing Test',
        passed: result.successfulLayers > 0,
        success: result.successfulLayers > 0,
        duration: executionTime,
        executionTime,
        details: result
      };
    } catch (error) {
      return {
        name: 'Code Processing Test',
        passed: false,
        success: false,
        duration: performance.now() - startTime,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async runMultipleCodeTests(code: string, iterations: number = 5): Promise<TestResult> {
    let totalPassed = 0;
    let totalDuration = 0;
    let allDetails: any[] = [];
    const startTime = performance.now();
  
    for (let i = 0; i < iterations; i++) {
      try {
        const result = await NeuroLintOrchestrator.processCode(code);
        totalPassed += result.successfulLayers > 0 ? 1 : 0;
        totalDuration += result.totalExecutionTime;
        allDetails.push(result);
      } catch (error) {
        return {
          name: `Multiple Code Tests (Failed at iteration ${i + 1})`,
          passed: false,
          success: false,
          duration: performance.now() - startTime,
          executionTime: performance.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: allDetails
        };
      }
    }
  
    const averageDuration = totalDuration / iterations;
    const overallPassed = totalPassed === iterations;
  
    return {
      name: 'Multiple Code Tests',
      passed: overallPassed,
      success: overallPassed,
      duration: performance.now() - startTime,
      executionTime: averageDuration,
      details: allDetails
    };
  }

  private async runSampleCodeTest(index: number): Promise<TestResult> {
    const startTime = performance.now();
    const sampleCode = this.sampleCodes[index] || 'console.log("test");';
    
    try {
      const result = await NeuroLintOrchestrator.processCode(sampleCode);
      const executionTime = performance.now() - startTime;
      
      return {
        name: `Sample Code Test ${index + 1}`,
        passed: result.successfulLayers > 0,
        success: result.successfulLayers > 0,
        duration: executionTime,
        executionTime,
        details: result
      };
    } catch (error) {
      return {
        name: `Sample Code Test ${index + 1}`,
        passed: false,
        success: false,
        duration: performance.now() - startTime,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async runComplexCodeTest(): Promise<TestResult> {
    const startTime = performance.now();
    const complexCode = this.getComplexTestCode();
    
    try {
      const result = await NeuroLintOrchestrator.processCode(complexCode);
      const executionTime = performance.now() - startTime;
      
      return {
        name: 'Complex Code Test',
        passed: result.successfulLayers > 0,
        success: result.successfulLayers > 0,
        duration: executionTime,
        executionTime,
        details: result
      };
    } catch (error) {
      return {
        name: 'Complex Code Test',
        passed: false,
        success: false,
        duration: performance.now() - startTime,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runPerformanceTests(): Promise<TestResult[]> {
    const singleTestResult = await this.runSingleTest();
    const asyncTestResult = await this.runAsyncTest();
    const singleCodeTestResult = await this.runSingleCodeTest('console.log("hello world");');
    const multipleCodeTestResult = await this.runMultipleCodeTests('console.log("hello world");', 3);
    const sampleCodeTest1Result = await this.runSampleCodeTest(0);
    const sampleCodeTest2Result = await this.runSampleCodeTest(1);
    const complexCodeTestResult = await this.runComplexCodeTest();

    return [
      singleTestResult,
      asyncTestResult,
      singleCodeTestResult,
      multipleCodeTestResult,
      sampleCodeTest1Result,
      sampleCodeTest2Result,
      complexCodeTestResult,
    ];
  }
}
