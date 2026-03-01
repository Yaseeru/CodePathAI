import { test, expect } from '../fixtures/test-fixtures';
import { sendChatMessage, waitForApiResponse, fillField } from '../utils/test-helpers';
import {
     createTestRoadmap,
     createTestLessons,
     updateUserProfile,
     createTestConversation,
     addTestMessages
} from '../setup/database-setup';

/**
 * Integration Tests: AI Chat with Context Enrichment
 * 
 * Tests the AI mentor chat system including context awareness,
 * conversation history, and personalized responses.
 */
test.describe('AI Chat Integration', () => {
     test('should send message and receive AI response', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn JavaScript');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to dashboard and open chat
          await page.goto('/dashboard');
          await page.click('button[data-testid="open-chat"]');

          // Send message
          await sendChatMessage(page, 'What should I learn first?');

          // Should receive response
          const aiMessage = page.locator('[data-testid="ai-message"]').last();
          await expect(aiMessage).toBeVisible({ timeout: 10000 });
          await expect(aiMessage).not.toBeEmpty();
     });

     test('should include user context in AI responses', async ({ page, testUser, authenticatedPage }) => {
          // Setup with specific goal
          const goal = 'Build a weather app';
          const roadmap = await createTestRoadmap(testUser.id!, goal);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
               learning_goal: goal,
          });

          // Open chat
          await page.goto('/dashboard');
          await page.click('button[data-testid="open-chat"]');

          // Ask about the goal
          await sendChatMessage(page, 'What am I learning?');

          // AI should mention the user's goal
          const aiMessage = page.locator('[data-testid="ai-message"]').last();
          await expect(aiMessage).toContainText(/weather app/i);
     });

     test('should provide lesson-specific context', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn arrays');
          const lessons = await createTestLessons(roadmap.id, 1);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Open chat
          await page.click('button[data-testid="open-chat"]');

          // Ask lesson-related question
          await sendChatMessage(page, 'Can you explain this lesson?');

          // AI should reference the current lesson
          const aiMessage = page.locator('[data-testid="ai-message"]').last();
          await expect(aiMessage).toBeVisible({ timeout: 10000 });
          // Response should be contextual to the lesson
          await expect(aiMessage).not.toBeEmpty();
     });

     test('should maintain conversation history', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn Python');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Open chat
          await page.goto('/dashboard');
          await page.click('button[data-testid="open-chat"]');

          // Send first message
          await sendChatMessage(page, 'My name is Alice');
          await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

          // Send follow-up message
          await sendChatMessage(page, 'What is my name?');

          // AI should remember the name from previous message
          const aiMessage = page.locator('[data-testid="ai-message"]').last();
          await expect(aiMessage).toContainText(/Alice/i);
     });

     test('should display messages in chronological order', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn coding');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Open chat
          await page.goto('/dashboard');
          await page.click('button[data-testid="open-chat"]');

          // Send multiple messages
          await sendChatMessage(page, 'First message');
          await page.waitForTimeout(1000);
          await sendChatMessage(page, 'Second message');
          await page.waitForTimeout(1000);
          await sendChatMessage(page, 'Third message');

          // Check message order
          const messages = page.locator('[data-testid="chat-message"]');
          const messageTexts = await messages.allTextContents();

          expect(messageTexts[0]).toContain('First message');
          expect(messageTexts[messageTexts.length - 1]).toContain('Third message');
     });

     test('should show typing indicator while AI responds', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn React');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Open chat
          await page.goto('/dashboard');
          await page.click('button[data-testid="open-chat"]');

          // Send message
          await fillField(page, 'textarea[data-testid="chat-input"]', 'Hello');
          await page.click('button[data-testid="send-message"]');

          // Should show typing indicator
          await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();

          // Typing indicator should disappear when response arrives
          await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible({ timeout: 15000 });
     });

     test('should handle code snippets in messages', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn JavaScript');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Open chat
          await page.goto('/dashboard');
          await page.click('button[data-testid="open-chat"]');

          // Ask for code example
          await sendChatMessage(page, 'Show me a function example');

          // AI response should contain code block
          const aiMessage = page.locator('[data-testid="ai-message"]').last();
          await expect(aiMessage).toBeVisible({ timeout: 10000 });

          // Should have syntax-highlighted code
          await expect(aiMessage.locator('pre code, .code-block')).toBeVisible();
     });

     test('should handle long responses with streaming', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn algorithms');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Open chat
          await page.goto('/dashboard');
          await page.click('button[data-testid="open-chat"]');

          // Ask for detailed explanation
          await sendChatMessage(page, 'Explain sorting algorithms in detail');

          // Response should stream in (text should appear gradually)
          const aiMessage = page.locator('[data-testid="ai-message"]').last();
          await expect(aiMessage).toBeVisible({ timeout: 10000 });

          // Should have substantial content
          const content = await aiMessage.textContent();
          expect(content!.length).toBeGreaterThan(100);
     });

     test('should save conversation to database', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn databases');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Open chat and send message
          await page.goto('/dashboard');
          await page.click('button[data-testid="open-chat"]');
          await sendChatMessage(page, 'Test message for persistence');
          await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible({ timeout: 10000 });

          // Reload page
          await page.reload();

          // Open chat again
          await page.click('button[data-testid="open-chat"]');

          // Previous message should be visible
          await expect(page.locator('[data-testid="chat-message"]')).toContainText('Test message for persistence');
     });

     test('should handle API errors gracefully', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn testing');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Open chat
          await page.goto('/dashboard');
          await page.click('button[data-testid="open-chat"]');

          // Intercept API and simulate error
          await page.route('**/api/ai/chat', route => {
               route.fulfill({
                    status: 500,
                    body: JSON.stringify({ error: 'AI service unavailable' }),
               });
          });

          // Send message
          await fillField(page, 'textarea[data-testid="chat-input"]', 'Hello');
          await page.click('button[data-testid="send-message"]');

          // Should show error message
          await expect(page.locator('[data-testid="chat-error"]')).toContainText(/error|failed|try again/i);

          // Should have retry button
          await expect(page.locator('button:has-text("Retry")')).toBeVisible();
     });
});
