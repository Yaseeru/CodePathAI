import { test, expect } from '../fixtures/test-fixtures';
import {
     completeOnboarding,
     navigateToLesson,
     executeCode,
     waitForElement
} from '../utils/test-helpers';
import {
     createTestRoadmap,
     createTestLessons,
     updateUserProfile
} from '../setup/database-setup';

/**
 * Critical User Journey: Lesson Completion → Next Lesson Unlock
 * 
 * This test validates that completing a lesson unlocks the next lesson
 * and updates progress correctly.
 */
test.describe('Lesson Completion and Unlock Journey', () => {
     test('should unlock next lesson after completing current lesson', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup: Create test roadmap and lessons
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn JavaScript basics');
          const lessons = await createTestLessons(roadmap.id, 3);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
               learning_goal: 'Learn JavaScript basics',
          });

          // Navigate to first lesson
          await page.goto(`/lesson/${lessons[0].id}`);
          await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();

          // Verify lesson timer starts
          await expect(page.locator('[data-testid="lesson-timer"]')).toBeVisible();

          // Complete the lesson exercise
          const code = 'console.log("Hello, World!");';
          await executeCode(page, code);

          // Verify code output
          await expect(page.locator('[data-testid="code-output"]')).toContainText('Hello, World!');

          // Mark lesson as complete
          await page.click('button:has-text("Complete Lesson")');

          // Should show completion message
          await expect(page.locator('[data-testid="completion-message"]')).toBeVisible();

          // Should show next lesson button
          const nextLessonButton = page.locator('button:has-text("Next Lesson")');
          await expect(nextLessonButton).toBeVisible();
          await nextLessonButton.click();

          // Should navigate to next lesson
          await page.waitForURL(`/lesson/${lessons[1].id}`);
          await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();

          // Verify progress is updated
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="lessons-completed"]')).toContainText('1');
     });

     test('should not allow skipping to locked lessons', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup: Create test roadmap and lessons
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn Python');
          const lessons = await createTestLessons(roadmap.id, 3);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
               learning_goal: 'Learn Python',
          });

          // Try to navigate directly to third lesson (should be locked)
          await page.goto(`/lesson/${lessons[2].id}`);

          // Should redirect to roadmap or show locked message
          await expect(
               page.locator('[data-testid="lesson-locked"]')
          ).toBeVisible().catch(() => {
               // Or should redirect to roadmap
               expect(page.url()).toContain('/roadmap');
          });
     });

     test('should track lesson completion time', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn HTML');
          const lessons = await createTestLessons(roadmap.id, 1);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Wait a few seconds to simulate learning time
          await page.waitForTimeout(3000);

          // Complete lesson
          await executeCode(page, '<h1>Hello</h1>');
          await page.click('button:has-text("Complete Lesson")');

          // Check that completion time is recorded
          await page.goto('/progress');
          const completedLesson = page.locator(`[data-lesson-id="${lessons[0].id}"]`);
          await expect(completedLesson).toContainText(/\d+ min/);
     });
});
