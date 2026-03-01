/**
 * Unit tests for test case execution
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runTestCases, formatTestResults } from '@/lib/code/test-runner';
import type { TestCase } from '@/lib/types';
import * as executor from '@/lib/code/executor';

// Mock the code execution service
vi.mock('@/lib/code/executor', () => ({
     codeExecutionService: {
          execute: vi.fn(),
     },
}));

describe('Test Runner', () => {
     beforeEach(() => {
          vi.clearAllMocks();
     });

     describe('runTestCases', () => {
          it('should return empty results for no test cases', async () => {
               const result = await runTestCases('const x = 1;', 'javascript', []);

               expect(result.totalTests).toBe(0);
               expect(result.passedTests).toBe(0);
               expect(result.failedTests).toBe(0);
               expect(result.overallPassed).toBe(true);
          });

          it('should execute test cases and return pass results', async () => {
               const testCases: TestCase[] = [
                    {
                         input: 5,
                         expectedOutput: 10,
                         description: 'Should double the input',
                    },
               ];

               // Mock successful execution
               vi.spyOn(executor.codeExecutionService, 'execute').mockResolvedValue({
                    stdout: '10',
                    stderr: '',
                    exitCode: 0,
                    executionTime: 100,
               });

               const result = await runTestCases(
                    'function main(x) { return x * 2; }',
                    'javascript',
                    testCases
               );

               expect(result.totalTests).toBe(1);
               expect(result.passedTests).toBe(1);
               expect(result.failedTests).toBe(0);
               expect(result.overallPassed).toBe(true);
               expect(result.results[0].passed).toBe(true);
          });

          it('should detect failed test cases', async () => {
               const testCases: TestCase[] = [
                    {
                         input: 5,
                         expectedOutput: 10,
                         description: 'Should double the input',
                    },
               ];

               // Mock execution with wrong output
               vi.spyOn(executor.codeExecutionService, 'execute').mockResolvedValue({
                    stdout: '15',
                    stderr: '',
                    exitCode: 0,
                    executionTime: 100,
               });

               const result = await runTestCases(
                    'function main(x) { return x * 3; }',
                    'javascript',
                    testCases
               );

               expect(result.totalTests).toBe(1);
               expect(result.passedTests).toBe(0);
               expect(result.failedTests).toBe(1);
               expect(result.overallPassed).toBe(false);
               expect(result.results[0].passed).toBe(false);
          });
     });
});
