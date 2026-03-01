import { test, expect } from '../fixtures/test-fixtures';
import { completeOnboarding, fillField, waitForApiResponse } from '../utils/test-helpers';
import { updateUserProfile } from '../setup/database-setup';

/**
 * Integration Tests: Roadmap Generation
 * 
 * Tests the AI-powered roadmap generation system including
 * goal processing, lesson creation, and project milestone generation.
 */
test.describe('Roadmap Generation Integration', () => {
     test('should generate roadmap from onboarding goal', async ({ page, testUser, authenticatedPage }) => {
          // Navigate to onboarding
          await page.goto('/onboarding');

          // Complete onboarding with specific goal
          const goal = 'Build a full-stack e-commerce website with payment integration';
          await completeOnboarding(page, goal, 10, 'intermediate');

          // Should generate and display roadmap
          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Should have roadmap title
          await expect(page.locator('[data-testid="roadmap-title"]')).toBeVisible();

          // Should have multiple lessons
          const lessonCards = page.locator('[data-testid="lesson-card"]');
          const lessonCount = await lessonCards.count();
          expect(lessonCount).toBeGreaterThanOrEqual(3);

          // Should have project milestones
          const projectCards = page.locator('[data-testid="project-milestone"]');
          const projectCount = await projectCards.count();
          expect(projectCount).toBeGreaterThanOrEqual(3);
     });

     test('should generate appropriate lessons for beginner level', async ({ page, testUser, authenticatedPage }) => {
          await page.goto('/onboarding');

          const goal = 'Learn to code and build my first website';
          await completeOnboarding(page, goal, 5, 'beginner');

          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // First lessons should be beginner-friendly
          const firstLesson = page.locator('[data-testid="lesson-card"]').first();
          await expect(firstLesson).toContainText(/introduction|basics|getting started/i);

          // Check difficulty indicators
          const difficultyBadges = page.locator('[data-testid="difficulty-badge"]');
          const firstBadge = difficultyBadges.first();
          await expect(firstBadge).toContainText(/beginner|easy/i);
     });

     test('should generate appropriate lessons for advanced level', async ({ page, testUser, authenticatedPage }) => {
          await page.goto('/onboarding');

          const goal = 'Build a microservices architecture with Kubernetes';
          await completeOnboarding(page, goal, 15, 'advanced');

          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Should include advanced topics
          const lessonTitles = await page.locator('[data-testid="lesson-card"]').allTextContents();
          const hasAdvancedTopics = lessonTitles.some(title =>
               /microservices|kubernetes|docker|architecture|scalability/i.test(title)
          );
          expect(hasAdvancedTopics).toBeTruthy();
     });

     test('should respect time commitment in lesson planning', async ({ page, testUser, authenticatedPage }) => {
          await page.goto('/onboarding');

          const goal = 'Learn Python programming';
          const timeCommitment = 3; // 3 hours per week
          await completeOnboarding(page, goal, timeCommitment, 'beginner');

          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Check estimated duration
          const durationText = await page.locator('[data-testid="roadmap-duration"]').textContent();
          expect(durationText).toMatch(/\d+ weeks?/);
     });

     test('should create lessons with proper prerequisites', async ({ page, testUser, authenticatedPage }) => {
          await page.goto('/onboarding');

          const goal = 'Learn React and build a web app';
          await completeOnboarding(page, goal, 8, 'beginner');

          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // First lesson should be unlocked
          const firstLesson = page.locator('[data-testid="lesson-card"]').first();
          await expect(firstLesson).not.toHaveClass(/locked/);

          // Later lessons should be locked
          const laterLessons = page.locator('[data-testid="lesson-card"]').nth(2);
          await expect(laterLessons).toHaveClass(/locked/);
     });

     test('should generate lessons with 15-minute duration', async ({ page, testUser, authenticatedPage }) => {
          await page.goto('/onboarding');

          const goal = 'Learn JavaScript fundamentals';
          await completeOnboarding(page, goal, 5, 'beginner');

          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Check lesson durations
          const durationElements = page.locator('[data-testid="lesson-duration"]');
          const durations = await durationElements.allTextContents();

          // All durations should be 15 minutes or less
          durations.forEach(duration => {
               const minutes = parseInt(duration.match(/\d+/)?.[0] || '0');
               expect(minutes).toBeLessThanOrEqual(15);
          });
     });

     test('should handle API errors gracefully', async ({ page, testUser, authenticatedPage }) => {
          await page.goto('/onboarding');

          // Fill onboarding form
          await fillField(page, 'textarea[name="goal"]', 'Learn coding');
          await page.click('button:has-text("Next")');
          await page.click('button:has-text("5 hours")');
          await page.click('button:has-text("Next")');
          await page.click('button:has-text("beginner")');

          // Intercept API call and simulate error
          await page.route('**/api/ai/generate-roadmap', route => {
               route.fulfill({
                    status: 500,
                    body: JSON.stringify({ error: 'Internal server error' }),
               });
          });

          await page.click('button:has-text("Generate Roadmap")');

          // Should show error message
          await expect(page.locator('[data-testid="error-message"]')).toContainText(/error|failed|try again/i);

          // Should have retry button
          await expect(page.locator('button:has-text("Retry")')).toBeVisible();
     });

     test('should save roadmap to database', async ({ page, testUser, authenticatedPage }) => {
          await page.goto('/onboarding');

          const goal = 'Build a mobile app';
          await completeOnboarding(page, goal, 6, 'intermediate');

          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Reload page
          await page.reload();

          // Roadmap should still be visible (loaded from database)
          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible();
          await expect(page.locator('[data-testid="learning-goal"]')).toContainText(goal);
     });

     test('should generate project milestones aligned with goal', async ({ page, testUser, authenticatedPage }) => {
          await page.goto('/onboarding');

          const goal = 'Build a blog platform with user authentication';
          await completeOnboarding(page, goal, 10, 'intermediate');

          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Check project titles
          const projectTitles = await page.locator('[data-testid="project-milestone"]').allTextContents();

          // Projects should relate to the goal
          const hasRelevantProjects = projectTitles.some(title =>
               /blog|authentication|user|post|article/i.test(title)
          );
          expect(hasRelevantProjects).toBeTruthy();
     });

     test('should display roadmap with visual timeline', async ({ page, testUser, authenticatedPage }) => {
          await page.goto('/onboarding');

          const goal = 'Learn web development';
          await completeOnboarding(page, goal, 7, 'beginner');

          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible({ timeout: 30000 });

          // Should have timeline visualization
          await expect(page.locator('[data-testid="roadmap-timeline"]')).toBeVisible();

          // Should show progress indicators
          await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible();
     });
});
