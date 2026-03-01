import { test, expect } from '../fixtures/test-fixtures';
import { fillField, login, logout } from '../utils/test-helpers';

/**
 * Integration Tests: Authentication Flow
 * 
 * Tests the complete authentication system including registration,
 * login, logout, password reset, and session management.
 */
test.describe('Authentication Integration', () => {
     test('should register new user and create session', async ({ page, testUser }) => {
          // Navigate to registration
          await page.goto('/register');

          // Fill registration form
          await fillField(page, 'input[name="name"]', testUser.name);
          await fillField(page, 'input[name="email"]', testUser.email);
          await fillField(page, 'input[name="password"]', testUser.password);
          await fillField(page, 'input[name="confirmPassword"]', testUser.password);

          // Submit
          await page.click('button[type="submit"]');

          // Should redirect to onboarding
          await page.waitForURL(/\/onboarding/);

          // Should have valid session
          const cookies = await page.context().cookies();
          const sessionCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
          expect(sessionCookie).toBeDefined();
     });

     test('should login with valid credentials', async ({ page, testUser }) => {
          // Login
          await login(page, testUser.email, testUser.password);

          // Should redirect to dashboard or onboarding
          await page.waitForURL(/\/(dashboard|onboarding)/);

          // Should show user menu
          await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
     });

     test('should reject invalid credentials', async ({ page }) => {
          await page.goto('/login');

          // Try invalid credentials
          await fillField(page, 'input[name="email"]', 'invalid@example.com');
          await fillField(page, 'input[name="password"]', 'wrongpassword');
          await page.click('button[type="submit"]');

          // Should show error message
          await expect(page.locator('[data-testid="login-error"]')).toContainText(/invalid|incorrect/i);

          // Should remain on login page
          expect(page.url()).toContain('/login');
     });

     test('should logout and clear session', async ({ page, testUser, authenticatedPage }) => {
          // Verify logged in
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

          // Logout
          await logout(page);

          // Should redirect to login
          expect(page.url()).toContain('/login');

          // Try to access protected page
          await page.goto('/dashboard');

          // Should redirect back to login
          await page.waitForURL(/\/login/);
     });

     test('should handle password reset flow', async ({ page, testUser }) => {
          // Navigate to password reset
          await page.goto('/reset-password');

          // Enter email
          await fillField(page, 'input[name="email"]', testUser.email);
          await page.click('button[type="submit"]');

          // Should show success message
          await expect(page.locator('[data-testid="reset-success"]')).toContainText(/email sent|check your email/i);
     });

     test('should validate email format', async ({ page }) => {
          await page.goto('/register');

          // Enter invalid email
          await fillField(page, 'input[name="email"]', 'notanemail');
          await page.click('button[type="submit"]');

          // Should show validation error
          await expect(page.locator('[data-testid="email-error"]')).toContainText(/valid email/i);
     });

     test('should validate password strength', async ({ page, testUser }) => {
          await page.goto('/register');

          await fillField(page, 'input[name="name"]', testUser.name);
          await fillField(page, 'input[name="email"]', testUser.email);

          // Try weak password
          await fillField(page, 'input[name="password"]', '123');

          // Should show password strength indicator
          await expect(page.locator('[data-testid="password-strength"]')).toContainText(/weak|too short/i);
     });

     test('should validate password confirmation match', async ({ page, testUser }) => {
          await page.goto('/register');

          await fillField(page, 'input[name="name"]', testUser.name);
          await fillField(page, 'input[name="email"]', testUser.email);
          await fillField(page, 'input[name="password"]', testUser.password);
          await fillField(page, 'input[name="confirmPassword"]', 'differentpassword');

          await page.click('button[type="submit"]');

          // Should show error
          await expect(page.locator('[data-testid="password-match-error"]')).toContainText(/match|same/i);
     });

     test('should persist session across page reloads', async ({ page, testUser, authenticatedPage }) => {
          // Navigate to dashboard
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

          // Reload page
          await page.reload();

          // Should still be authenticated
          await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
          expect(page.url()).toContain('/dashboard');
     });

     test('should redirect unauthenticated users to login', async ({ page }) => {
          // Try to access protected page without authentication
          await page.goto('/dashboard');

          // Should redirect to login
          await page.waitForURL(/\/login/);
     });

     test('should redirect authenticated users away from auth pages', async ({ page, testUser, authenticatedPage }) => {
          // Try to access login page while authenticated
          await page.goto('/login');

          // Should redirect to dashboard
          await page.waitForURL(/\/dashboard/);
     });
});
