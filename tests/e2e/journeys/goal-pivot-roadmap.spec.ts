import { test, expect } from '../fixtures/test-fixtures';
import {
     waitForElement,
     fillField,
     waitForApiResponse
} from '../utils/test-helpers';
import {
     createTestRoadmap,
     createTestLessons,
     completeLessonForUser,
     updateUserProfile
} from '../setup/database-setup';

/**
 * Critical User Journey: Goal Pivot → New Roadmap
 * 
 * This test validates that users can change their learning goal
 * and receive a new personalized roadmap while preserving their progress.
 */
test.describe('Goal Pivot and New Roadmap Journey', () => {
     test('should allow user to change goal and generate new roadmap', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup: Create initial roadmap with some progress
          const initialRoadmap = await createTestRoadmap(testUser.id!, 'Learn React');
          const lessons = await createTestLessons(initialRoadmap.id, 3);

          // Complete some lessons
          await completeLessonForUser(testUser.id!, lessons[0].id);
          await completeLessonForUser(testUser.id!, lessons[1].id);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
               learning_goal: 'Learn React',
          });

          // Navigate to dashboard
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="learning-goal"]')).toContainText('Learn React');

          // Click "Change Goal" button
          await page.click('button:has-text("Change Goal")');

          // Should show goal pivot interface
          await expect(page.locator('[data-testid="goal-pivot-modal"]')).toBeVisible();

          // Should show warning about creating new roadmap
          await expect(page.locator('[data-testid="pivot-warning"]')).toContainText(/new learning path|new roadmap/i);

          // Enter new goal
          const newGoal = 'Build a mobile app with React Native';
          await fillField(page, 'textarea[name="newGoal"]', newGoal);

          // Confirm goal change
          await page.click('button:has-text("Generate New Roadmap")');

          // Wait for new roadmap generation
          const roadmapPromise = waitForApiResponse(page, '/api/ai/generate-roadmap');
          await roadmapPromise;

          // Should show new roadmap
          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Should display new goal
          await expect(page.locator('[data-testid="learning-goal"]')).toContainText(newGoal);

          // Should show new lessons
          await expect(page.locator('[data-testid="lesson-card"]')).toHaveCount(3, { timeout: 10000 });
     });

     test('should preserve completed lessons after goal pivot', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const initialRoadmap = await createTestRoadmap(testUser.id!, 'Learn Python');
          const lessons = await createTestLessons(initialRoadmap.id, 3);

          await completeLessonForUser(testUser.id!, lessons[0].id);
          await completeLessonForUser(testUser.id!, lessons[1].id);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
               learning_goal: 'Learn Python',
          });

          // Check initial progress
          await page.goto('/progress');
          const initialCompletedCount = await page.locator('[data-testid="lessons-completed"]').textContent();

          // Change goal
          await page.goto('/dashboard');
          await page.click('button:has-text("Change Goal")');
          await fillField(page, 'textarea[name="newGoal"]', 'Learn Django web development');
          await page.click('button:has-text("Generate New Roadmap")');

          // Wait for new roadmap
          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Check progress is preserved
          await page.goto('/progress');
          const newCompletedCount = await page.locator('[data-testid="lessons-completed"]').textContent();

          // Completed lesson count should be the same
          expect(newCompletedCount).toBe(initialCompletedCount);
     });

     test('should archive old roadmap when pivoting', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const initialRoadmap = await createTestRoadmap(testUser.id!, 'Learn Vue.js');
          const lessons = await createTestLessons(initialRoadmap.id, 2);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
               learning_goal: 'Learn Vue.js',
          });

          // Change goal
          await page.goto('/dashboard');
          await page.click('button:has-text("Change Goal")');
          await fillField(page, 'textarea[name="newGoal"]', 'Learn Angular');
          await page.click('button:has-text("Generate New Roadmap")');

          // Wait for new roadmap
          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Navigate to settings or roadmap history
          await page.goto('/settings');
          await page.click('button:has-text("View Roadmap History")');

          // Should show archived roadmap
          await expect(page.locator('[data-testid="archived-roadmap"]')).toBeVisible();
          await expect(page.locator('[data-testid="archived-roadmap"]')).toContainText('Learn Vue.js');
          await expect(page.locator('[data-testid="roadmap-status"]')).toContainText('Archived');
     });

     test('should validate new goal input', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn JavaScript');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to dashboard
          await page.goto('/dashboard');
          await page.click('button:has-text("Change Goal")');

          // Try to submit with empty goal
          await page.click('button:has-text("Generate New Roadmap")');

          // Should show validation error
          await expect(page.locator('[data-testid="goal-error"]')).toContainText(/required|enter/i);

          // Try with too short goal
          await fillField(page, 'textarea[name="newGoal"]', 'Learn');
          await page.click('button:has-text("Generate New Roadmap")');

          // Should show validation error
          await expect(page.locator('[data-testid="goal-error"]')).toContainText(/at least|minimum/i);

          // Enter valid goal
          await fillField(page, 'textarea[name="newGoal"]', 'Learn full-stack web development with Node.js and React');

          // Error should disappear
          await expect(page.locator('[data-testid="goal-error"]')).not.toBeVisible();
     });

     test('should allow canceling goal pivot', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn TypeScript');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
               learning_goal: 'Learn TypeScript',
          });

          // Navigate to dashboard
          await page.goto('/dashboard');
          const originalGoal = await page.locator('[data-testid="learning-goal"]').textContent();

          // Open goal pivot modal
          await page.click('button:has-text("Change Goal")');
          await expect(page.locator('[data-testid="goal-pivot-modal"]')).toBeVisible();

          // Enter new goal but cancel
          await fillField(page, 'textarea[name="newGoal"]', 'Learn Rust programming');
          await page.click('button:has-text("Cancel")');

          // Modal should close
          await expect(page.locator('[data-testid="goal-pivot-modal"]')).not.toBeVisible();

          // Goal should remain unchanged
          await expect(page.locator('[data-testid="learning-goal"]')).toContainText(originalGoal!);
     });
});
