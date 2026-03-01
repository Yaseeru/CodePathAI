import { test, expect } from '../fixtures/test-fixtures';
import {
     executeCode,
     sendChatMessage,
     waitForElement,
     waitForApiResponse
} from '../utils/test-helpers';
import {
     createTestRoadmap,
     createTestLessons,
     updateUserProfile
} from '../setup/database-setup';

/**
 * Critical User Journey: Code Execution → AI Help → Completion
 * 
 * This test validates the complete learning flow where a user writes code,
 * gets stuck, asks the AI mentor for help, and completes the lesson.
 */
test.describe('Code Execution and AI Help Journey', () => {
     test('should execute code and get AI help when stuck', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn JavaScript functions');
          const lessons = await createTestLessons(roadmap.id, 1);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);
          await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();

          // Step 1: Try to execute code with an error
          const buggyCode = 'console.log("Hello World"';  // Missing closing parenthesis
          await executeCode(page, buggyCode);

          // Should show error in output
          await expect(page.locator('[data-testid="code-output"]')).toContainText(/error|Error|SyntaxError/i);

          // Step 2: Open AI chat
          const chatButton = page.locator('button[data-testid="open-chat"]');
          await chatButton.click();
          await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

          // Step 3: Ask AI for help
          const helpMessage = 'I\'m getting a syntax error. Can you help me fix it?';
          await sendChatMessage(page, helpMessage);

          // Should receive AI response
          const aiResponse = page.locator('[data-testid="ai-message"]').last();
          await expect(aiResponse).toBeVisible();
          await expect(aiResponse).toContainText(/syntax|parenthesis|closing/i);

          // Step 4: Fix the code based on AI suggestion
          const fixedCode = 'console.log("Hello World");';
          await executeCode(page, fixedCode);

          // Should show successful output
          await expect(page.locator('[data-testid="code-output"]')).toContainText('Hello World');

          // Step 5: Complete the lesson
          await page.click('button:has-text("Complete Lesson")');
          await expect(page.locator('[data-testid="completion-message"]')).toBeVisible();
     });

     test('should provide context-aware AI responses', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn arrays');
          const lessons = await createTestLessons(roadmap.id, 1);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
               learning_goal: 'Learn arrays',
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Open chat
          await page.click('button[data-testid="open-chat"]');

          // Ask a question related to the lesson
          await sendChatMessage(page, 'How do I create an array?');

          // Wait for AI response
          const responsePromise = waitForApiResponse(page, '/api/ai/chat');
          await responsePromise;

          // AI should provide context-aware response mentioning the current lesson
          const aiMessage = page.locator('[data-testid="ai-message"]').last();
          await expect(aiMessage).toBeVisible();
          await expect(aiMessage).toContainText(/array/i);
     });

     test('should handle code execution timeout gracefully', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn loops');
          const lessons = await createTestLessons(roadmap.id, 1);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Execute code with infinite loop (should timeout)
          const infiniteLoopCode = 'while(true) { console.log("loop"); }';
          await executeCode(page, infiniteLoopCode);

          // Should show timeout message
          await expect(page.locator('[data-testid="code-output"]')).toContainText(/timeout|exceeded/i, {
               timeout: 35000, // Wait for execution timeout + buffer
          });
     });

     test('should save code automatically', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn variables');
          const lessons = await createTestLessons(roadmap.id, 1);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Write some code
          const code = 'const greeting = "Hello";';
          await page.click('.monaco-editor');
          await page.keyboard.type(code);

          // Wait for auto-save (30 seconds according to requirements)
          await page.waitForTimeout(31000);

          // Refresh the page
          await page.reload();

          // Code should be restored
          await expect(page.locator('.monaco-editor')).toContainText(code);
     });
});
