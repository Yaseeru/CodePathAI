import { Page, expect } from '@playwright/test';

/**
 * Wait for an element to be visible and return it
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000) {
     await page.waitForSelector(selector, { state: 'visible', timeout });
     return page.locator(selector);
}

/**
 * Fill a form field and wait for it to be updated
 */
export async function fillField(page: Page, selector: string, value: string) {
     await page.fill(selector, value);
     await expect(page.locator(selector)).toHaveValue(value);
}

/**
 * Click a button and wait for navigation or response
 */
export async function clickAndWait(page: Page, selector: string, waitForNavigation = false) {
     if (waitForNavigation) {
          await Promise.all([
               page.waitForNavigation(),
               page.click(selector),
          ]);
     } else {
          await page.click(selector);
     }
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
     return page.waitForResponse(response => {
          const url = response.url();
          if (typeof urlPattern === 'string') {
               return url.includes(urlPattern);
          }
          return urlPattern.test(url);
     });
}

/**
 * Complete the onboarding flow
 */
export async function completeOnboarding(
     page: Page,
     goal: string,
     timeCommitment: number,
     experienceLevel: 'beginner' | 'intermediate' | 'advanced'
) {
     // Step 1: Enter goal
     await fillField(page, 'textarea[name="goal"]', goal);
     await clickAndWait(page, 'button:has-text("Next")');

     // Step 2: Select time commitment
     await page.click(`button:has-text("${timeCommitment} hours")`);
     await clickAndWait(page, 'button:has-text("Next")');

     // Step 3: Select experience level
     await page.click(`button:has-text("${experienceLevel}")`);

     // Wait for roadmap generation
     const generateButton = page.locator('button:has-text("Generate Roadmap")');
     await generateButton.click();

     // Wait for roadmap to be generated (this may take a few seconds)
     await page.waitForSelector('[data-testid="roadmap-view"]', { timeout: 30000 });
}

/**
 * Login with credentials
 */
export async function login(page: Page, email: string, password: string) {
     await page.goto('/login');
     await fillField(page, 'input[name="email"]', email);
     await fillField(page, 'input[name="password"]', password);
     await clickAndWait(page, 'button[type="submit"]', true);
}

/**
 * Logout
 */
export async function logout(page: Page) {
     await page.click('[data-testid="user-menu"]');
     await page.click('button:has-text("Logout")');
     await page.waitForURL('/login');
}

/**
 * Navigate to a lesson
 */
export async function navigateToLesson(page: Page, lessonId: string) {
     await page.goto(`/lesson/${lessonId}`);
     await page.waitForSelector('[data-testid="lesson-content"]');
}

/**
 * Execute code in the editor
 */
export async function executeCode(page: Page, code: string) {
     // Focus the Monaco editor
     await page.click('.monaco-editor');

     // Clear existing code (Ctrl+A, Delete)
     await page.keyboard.press('Control+A');
     await page.keyboard.press('Delete');

     // Type new code
     await page.keyboard.type(code);

     // Click run button
     await page.click('button:has-text("Run Code")');

     // Wait for output
     await page.waitForSelector('[data-testid="code-output"]', { timeout: 15000 });
}

/**
 * Submit a project
 */
export async function submitProject(page: Page, projectId: string, code: string) {
     await page.goto(`/project/${projectId}`);
     await executeCode(page, code);
     await page.click('button:has-text("Submit Project")');

     // Wait for review
     await page.waitForSelector('[data-testid="code-review"]', { timeout: 20000 });
}

/**
 * Send a chat message
 */
export async function sendChatMessage(page: Page, message: string) {
     await fillField(page, 'textarea[data-testid="chat-input"]', message);
     await page.click('button[data-testid="send-message"]');

     // Wait for AI response
     await page.waitForSelector('[data-testid="ai-message"]', { timeout: 10000 });
}

/**
 * Check if element contains text
 */
export async function expectTextContent(page: Page, selector: string, text: string) {
     const element = page.locator(selector);
     await expect(element).toContainText(text);
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
     await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingComplete(page: Page) {
     // Wait for any loading spinners to disappear
     await page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 10000 }).catch(() => {
          // Ignore if loading indicator doesn't exist
     });
}

/**
 * Get text content from an element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
     const element = page.locator(selector);
     return (await element.textContent()) || '';
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
     try {
          await page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 });
          return true;
     } catch {
          return false;
     }
}
