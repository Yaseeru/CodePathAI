import { test, expect } from '../fixtures/test-fixtures';
import { completeOnboarding, waitForElement, fillField } from '../utils/test-helpers';

/**
 * Critical User Journey: Registration → Onboarding → First Lesson
 * 
 * This test validates the complete new user experience from account creation
 * through onboarding to starting their first lesson.
 */
test.describe('Registration to First Lesson Journey', () => {
     test('should complete full registration and onboarding flow', async ({ page, testUser }) => {
          // Step 1: Navigate to registration page
          await page.goto('/register');
          await expect(page).toHaveTitle(/Register|Sign Up/);

          // Step 2: Fill registration form
          await fillField(page, 'input[name="name"]', testUser.name);
          await fillField(page, 'input[name="email"]', testUser.email);
          await fillField(page, 'input[name="password"]', testUser.password);
          await fillField(page, 'input[name="confirmPassword"]', testUser.password);

          // Step 3: Submit registration
          await page.click('button[type="submit"]');

          // Step 4: Should redirect to onboarding
          await page.waitForURL(/\/onboarding/);
          await expect(page.locator('h1')).toContainText(/Welcome|Get Started/);

          // Step 5: Complete onboarding
          const goal = 'I want to build a todo app with React';
          await completeOnboarding(page, goal, 5, 'beginner');

          // Step 6: Should see roadmap
          await expect(page.locator('[data-testid="roadmap-view"]')).toBeVisible();
          await expect(page.locator('[data-testid="roadmap-title"]')).toBeVisible();

          // Step 7: Click on first lesson
          const firstLesson = page.locator('[data-testid="lesson-card"]').first();
          await expect(firstLesson).toBeVisible();
          await firstLesson.click();

          // Step 8: Should navigate to lesson page
          await page.waitForURL(/\/lesson\//);
          await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();
          await expect(page.locator('[data-testid="lesson-timer"]')).toBeVisible();

          // Step 9: Verify lesson components are present
          await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
          await expect(page.locator('button:has-text("Run Code")')).toBeVisible();
     });

     test('should persist user data after registration', async ({ page, testUser }) => {
          // Register and complete onboarding
          await page.goto('/register');
          await fillField(page, 'input[name="name"]', testUser.name);
          await fillField(page, 'input[name="email"]', testUser.email);
          await fillField(page, 'input[name="password"]', testUser.password);
          await fillField(page, 'input[name="confirmPassword"]', testUser.password);
          await page.click('button[type="submit"]');

          await page.waitForURL(/\/onboarding/);
          const goal = 'Build a portfolio website';
          await completeOnboarding(page, goal, 3, 'intermediate');

          // Navigate to dashboard
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="user-name"]')).toContainText(testUser.name);
          await expect(page.locator('[data-testid="learning-goal"]')).toContainText(goal);
     });
});
