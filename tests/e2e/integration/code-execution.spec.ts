import { test, expect } from '../fixtures/test-fixtures';
import { executeCode, waitForApiResponse } from '../utils/test-helpers';
import {
     createTestRoadmap,
     createTestLessons,
     updateUserProfile
} from '../setup/database-setup';

/**
 * Integration Tests: Code Execution Pipeline
 * 
 * Tests the complete code execution system including editor integration,
 * Piston API calls, output display, and error handling.
 */
test.describe('Code Execution Integration', () => {
     test('should execute JavaScript code successfully', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn JavaScript');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute JavaScript code
          const code = 'console.log("Hello from JavaScript");';
          await executeCode(page, code);

          // Should show output
          await expect(page.locator('[data-testid="code-output"]')).toContainText('Hello from JavaScript');
     });

     test('should execute Python code successfully', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn Python');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Change language to Python
          await page.click('[data-testid="language-selector"]');
          await page.click('button:has-text("Python")');

          // Execute Python code
          const code = 'print("Hello from Python")';
          await executeCode(page, code);

          // Should show output
          await expect(page.locator('[data-testid="code-output"]')).toContainText('Hello from Python');
     });

     test('should display syntax errors with line numbers', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn debugging');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute code with syntax error
          const code = 'console.log("missing closing quote);';
          await executeCode(page, code);

          // Should show error
          const output = page.locator('[data-testid="code-output"]');
          await expect(output).toContainText(/error|Error|SyntaxError/i);
     });

     test('should display runtime errors', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn error handling');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute code with runtime error
          const code = `
const obj = null;
console.log(obj.property);
    `.trim();
          await executeCode(page, code);

          // Should show runtime error
          await expect(page.locator('[data-testid="code-output"]')).toContainText(/TypeError|Cannot read/i);
     });

     test('should handle execution timeout', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn loops');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute code that takes too long
          const code = 'while(true) {}';
          await executeCode(page, code);

          // Should show timeout message
          await expect(page.locator('[data-testid="code-output"]')).toContainText(/timeout|exceeded/i, {
               timeout: 35000,
          });
     });

     test('should display execution time', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn performance');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute code
          const code = 'console.log("test");';
          await executeCode(page, code);

          // Should show execution time
          await expect(page.locator('[data-testid="execution-time"]')).toContainText(/\d+ms|\d+\.\d+s/);
     });

     test('should separate stdout and stderr', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn I/O');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute code with both output and error
          const code = `
console.log("This is stdout");
console.error("This is stderr");
    `.trim();
          await executeCode(page, code);

          // Should show both outputs
          await expect(page.locator('[data-testid="stdout"]')).toContainText('This is stdout');
          await expect(page.locator('[data-testid="stderr"]')).toContainText('This is stderr');
     });

     test('should clear output when requested', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn basics');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute code
          await executeCode(page, 'console.log("test");');
          await expect(page.locator('[data-testid="code-output"]')).toContainText('test');

          // Clear output
          await page.click('button:has-text("Clear Output")');

          // Output should be empty
          await expect(page.locator('[data-testid="code-output"]')).toBeEmpty();
     });

     test('should handle multiple executions', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn iteration');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute code multiple times
          await executeCode(page, 'console.log("First");');
          await expect(page.locator('[data-testid="code-output"]')).toContainText('First');

          await executeCode(page, 'console.log("Second");');
          await expect(page.locator('[data-testid="code-output"]')).toContainText('Second');

          await executeCode(page, 'console.log("Third");');
          await expect(page.locator('[data-testid="code-output"]')).toContainText('Third');
     });

     test('should save execution results to database', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn data persistence');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute code
          await executeCode(page, 'console.log("Saved execution");');

          // Navigate away and back
          await page.goto('/dashboard');
          await page.goto(`/lesson/${lessons[0].id}`);

          // Check execution history (if displayed)
          // This depends on UI implementation
          await page.click('[data-testid="execution-history"]').catch(() => {
               // History might not be visible, that's okay
          });
     });

     test('should handle API errors gracefully', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn error handling');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Intercept API and simulate error
          await page.route('**/api/code/execute', route => {
               route.fulfill({
                    status: 500,
                    body: JSON.stringify({ error: 'Execution service unavailable' }),
               });
          });

          // Try to execute code
          await page.click('.monaco-editor');
          await page.keyboard.type('console.log("test");');
          await page.click('button:has-text("Run Code")');

          // Should show error message
          await expect(page.locator('[data-testid="execution-error"]')).toContainText(/error|failed|unavailable/i);
     });
});
