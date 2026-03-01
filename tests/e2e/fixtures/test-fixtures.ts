import { test as base, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Test user interface
 */
export interface TestUser {
     email: string;
     password: string;
     name: string;
     id?: string;
}

/**
 * Extended test fixtures for CodePath AI E2E tests
 */
type TestFixtures = {
     testUser: TestUser;
     authenticatedPage: any;
};

/**
 * Create a test user in the database
 */
async function createTestUser(): Promise<TestUser> {
     const timestamp = Date.now();
     const testUser: TestUser = {
          email: `test-${timestamp}@codepath.test`,
          password: 'TestPassword123!',
          name: `Test User ${timestamp}`,
     };

     // Create user via Supabase Auth
     const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
     );

     const { data, error } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
          user_metadata: {
               name: testUser.name,
          },
     });

     if (error) {
          throw new Error(`Failed to create test user: ${error.message}`);
     }

     testUser.id = data.user.id;

     // Create user profile
     const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
               id: data.user.id,
               name: testUser.name,
               email: testUser.email,
               onboarding_completed: false,
          });

     if (profileError) {
          throw new Error(`Failed to create user profile: ${profileError.message}`);
     }

     return testUser;
}

/**
 * Delete a test user from the database
 */
async function deleteTestUser(userId: string): Promise<void> {
     const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
     );

     // Delete user (cascade will handle related data)
     const { error } = await supabase.auth.admin.deleteUser(userId);

     if (error) {
          console.error(`Failed to delete test user: ${error.message}`);
     }
}

/**
 * Extended test with fixtures
 */
export const test = base.extend<TestFixtures>({
     /**
      * Provides a fresh test user for each test
      */
     testUser: async ({ }, use) => {
          const user = await createTestUser();
          await use(user);
          if (user.id) {
               await deleteTestUser(user.id);
          }
     },

     /**
      * Provides an authenticated page with a logged-in test user
      */
     authenticatedPage: async ({ page, testUser }, use) => {
          // Navigate to login page
          await page.goto('/login');

          // Fill in credentials
          await page.fill('input[name="email"]', testUser.email);
          await page.fill('input[name="password"]', testUser.password);

          // Submit login form
          await page.click('button[type="submit"]');

          // Wait for navigation to complete
          await page.waitForURL(/\/(dashboard|onboarding)/);

          await use(page);
     },
});

export { expect };
