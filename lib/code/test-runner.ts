/**
 * Test Case Execution Service
 * Executes user code against test cases and returns pass/fail results
 */

import { codeExecutionService, type ExecutionResult } from './executor';
import type { TestCase } from '@/lib/types';

export interface TestCaseResult {
     testCase: TestCase;
     passed: boolean;
     actualOutput: any;
     error?: string;
     executionTime: number;
}

export interface TestRunResult {
     totalTests: number;
     passedTests: number;
     failedTests: number;
     results: TestCaseResult[];
     overallPassed: boolean;
}

/**
 * Runs test cases against user code
 * Executes user code with each test case input and compares with expected output
 * 
 * @param code - User's code to test
 * @param language - Programming language
 * @param testCases - Array of test cases to run
 * @returns Test run results with pass/fail for each test
 */
export async function runTestCases(
     code: string,
     language: 'javascript' | 'python' | 'html',
     testCases: TestCase[]
): Promise<TestRunResult> {
     if (!testCases || testCases.length === 0) {
          return {
               totalTests: 0,
               passedTests: 0,
               failedTests: 0,
               results: [],
               overallPassed: true,
          };
     }

     const results: TestCaseResult[] = [];

     // Execute each test case
     for (const testCase of testCases) {
          const result = await executeTestCase(code, language, testCase);
          results.push(result);
     }

     // Calculate summary
     const passedTests = results.filter(r => r.passed).length;
     const failedTests = results.filter(r => !r.passed).length;

     return {
          totalTests: testCases.length,
          passedTests,
          failedTests,
          results,
          overallPassed: failedTests === 0,
     };
}

/**
 * Executes a single test case
 * 
 * @param code - User's code
 * @param language - Programming language
 * @param testCase - Test case to execute
 * @returns Test case result
 */
async function executeTestCase(
     code: string,
     language: 'javascript' | 'python' | 'html',
     testCase: TestCase
): Promise<TestCaseResult> {
     const startTime = Date.now();

     try {
          // Wrap user code with test harness based on language
          const wrappedCode = wrapCodeWithTestHarness(code, language, testCase);

          // Execute the wrapped code
          const executionResult = await codeExecutionService.execute(
               wrappedCode,
               language
          );

          const executionTime = Date.now() - startTime;

          // Parse the output
          const actualOutput = parseOutput(executionResult, language);

          // Compare actual output with expected output
          const passed = compareOutputs(actualOutput, testCase.expectedOutput);

          return {
               testCase,
               passed,
               actualOutput,
               error: executionResult.error || (executionResult.exitCode !== 0 ? executionResult.stderr : undefined),
               executionTime,
          };
     } catch (error) {
          const executionTime = Date.now() - startTime;
          return {
               testCase,
               passed: false,
               actualOutput: null,
               error: error instanceof Error ? error.message : 'Unknown error',
               executionTime,
          };
     }
}

/**
 * Wraps user code with test harness to inject input and capture output
 * 
 * @param code - User's code
 * @param language - Programming language
 * @param testCase - Test case with input
 * @returns Wrapped code
 */
function wrapCodeWithTestHarness(
     code: string,
     language: 'javascript' | 'python' | 'html',
     testCase: TestCase
): string {
     const input = JSON.stringify(testCase.input);

     switch (language) {
          case 'javascript':
               return `
${code}

// Test harness
const testInput = ${input};
const result = typeof main === 'function' ? main(testInput) : testInput;
console.log(JSON.stringify(result));
               `.trim();

          case 'python':
               return `
import json

${code}

# Test harness
test_input = json.loads('${input.replace(/'/g, "\\'")}')
result = main(test_input) if 'main' in dir() else test_input
print(json.dumps(result))
               `.trim();

          case 'html':
               // HTML doesn't support traditional test execution
               // Return the code as-is
               return code;

          default:
               return code;
     }
}

/**
 * Parses execution output to extract the result
 * 
 * @param executionResult - Execution result from code executor
 * @param language - Programming language
 * @returns Parsed output
 */
function parseOutput(executionResult: ExecutionResult, language: string): any {
     if (executionResult.exitCode !== 0) {
          return null;
     }

     const output = executionResult.stdout.trim();

     if (!output) {
          return null;
     }

     // Try to parse as JSON
     try {
          return JSON.parse(output);
     } catch {
          // If not JSON, return as string
          return output;
     }
}

/**
 * Compares actual output with expected output
 * Handles different data types and deep equality
 * 
 * @param actual - Actual output from code execution
 * @param expected - Expected output from test case
 * @returns True if outputs match
 */
function compareOutputs(actual: any, expected: any): boolean {
     // Handle null/undefined
     if (actual === null && expected === null) return true;
     if (actual === undefined && expected === undefined) return true;
     if (actual === null || expected === null) return false;
     if (actual === undefined || expected === undefined) return false;

     // Handle primitives
     if (typeof actual !== 'object' && typeof expected !== 'object') {
          // For numbers, allow small floating point differences
          if (typeof actual === 'number' && typeof expected === 'number') {
               return Math.abs(actual - expected) < 0.0001;
          }
          return actual === expected;
     }

     // Handle arrays
     if (Array.isArray(actual) && Array.isArray(expected)) {
          if (actual.length !== expected.length) return false;
          return actual.every((item, index) => compareOutputs(item, expected[index]));
     }

     // Handle objects
     if (typeof actual === 'object' && typeof expected === 'object') {
          const actualKeys = Object.keys(actual).sort();
          const expectedKeys = Object.keys(expected).sort();

          if (actualKeys.length !== expectedKeys.length) return false;
          if (!actualKeys.every((key, index) => key === expectedKeys[index])) return false;

          return actualKeys.every(key => compareOutputs(actual[key], expected[key]));
     }

     return false;
}

/**
 * Formats test results for display to user
 * 
 * @param results - Test run results
 * @returns Formatted string for display
 */
export function formatTestResults(results: TestRunResult): string {
     const lines: string[] = [];

     lines.push(`Test Results: ${results.passedTests}/${results.totalTests} passed`);
     lines.push('');

     results.results.forEach((result, index) => {
          const status = result.passed ? '✓ PASS' : '✗ FAIL';
          lines.push(`${status} Test ${index + 1}: ${result.testCase.description}`);

          if (!result.passed) {
               lines.push(`  Expected: ${JSON.stringify(result.testCase.expectedOutput)}`);
               lines.push(`  Actual:   ${JSON.stringify(result.actualOutput)}`);
               if (result.error) {
                    lines.push(`  Error:    ${result.error}`);
               }
          }

          lines.push(`  Time:     ${result.executionTime}ms`);
          lines.push('');
     });

     return lines.join('\n');
}
