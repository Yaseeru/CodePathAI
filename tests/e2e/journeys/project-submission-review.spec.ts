import { test, expect } from '../fixtures/test-fixtures';
import {
     submitProject,
     executeCode,
     waitForElement,
     waitForApiResponse
} from '../utils/test-helpers';
import {
     createTestRoadmap,
     createTestLessons,
     createTestProject,
     completeLessonForUser,
     updateUserProfile
} from '../setup/database-setup';

/**
 * Critical User Journey: Project Submission → Review → Completion
 * 
 * This test validates the complete project workflow from submission
 * through AI code review to project completion.
 */
test.describe('Project Submission and Review Journey', () => {
     test('should submit project and receive AI code review', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Build a calculator');
          const lessons = await createTestLessons(roadmap.id, 2);
          const project = await createTestProject(roadmap.id, lessons[1].id);

          // Complete prerequisite lessons
          await completeLessonForUser(testUser.id!, lessons[0].id);
          await completeLessonForUser(testUser.id!, lessons[1].id);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to project
          await page.goto(`/project/${project.id}`);
          await expect(page.locator('[data-testid="project-title"]')).toBeVisible();

          // View project requirements
          await expect(page.locator('[data-testid="project-requirements"]')).toBeVisible();
          await expect(page.locator('[data-testid="success-criteria"]')).toBeVisible();

          // Write project code
          const projectCode = `
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

console.log(add(5, 3));
console.log(subtract(10, 4));
    `.trim();

          await executeCode(page, projectCode);

          // Verify code runs
          await expect(page.locator('[data-testid="code-output"]')).toContainText('8');
          await expect(page.locator('[data-testid="code-output"]')).toContainText('6');

          // Submit project for review
          await page.click('button:has-text("Submit Project")');

          // Wait for AI review
          const reviewPromise = waitForApiResponse(page, '/api/ai/review-code');
          await reviewPromise;

          // Should show code review
          await expect(page.locator('[data-testid="code-review"]')).toBeVisible({ timeout: 20000 });

          // Review should contain feedback
          const review = page.locator('[data-testid="code-review"]');
          await expect(review).toContainText(/feedback|review|score/i);

          // Should show review score
          await expect(page.locator('[data-testid="review-score"]')).toBeVisible();

          // Should have option to revise or complete
          await expect(
               page.locator('button:has-text("Revise Code"), button:has-text("Mark Complete")')
          ).toBeVisible();
     });

     test('should allow code revision after review', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Build a todo app');
          const lessons = await createTestLessons(roadmap.id, 1);
          const project = await createTestProject(roadmap.id, lessons[0].id);

          await completeLessonForUser(testUser.id!, lessons[0].id);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to project
          await page.goto(`/project/${project.id}`);

          // Submit initial code
          const initialCode = 'console.log("todo app");';
          await executeCode(page, initialCode);
          await page.click('button:has-text("Submit Project")');

          // Wait for review
          await expect(page.locator('[data-testid="code-review"]')).toBeVisible({ timeout: 20000 });

          // Click revise button
          await page.click('button:has-text("Revise Code")');

          // Should return to editor
          await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();

          // Make revisions
          const revisedCode = `
const todos = [];

function addTodo(task) {
  todos.push({ task, completed: false });
}

addTodo("Learn JavaScript");
console.log(todos);
    `.trim();

          await executeCode(page, revisedCode);

          // Resubmit
          await page.click('button:has-text("Submit Project")');

          // Should get new review
          await expect(page.locator('[data-testid="code-review"]')).toBeVisible({ timeout: 20000 });
     });

     test('should mark project as complete and update progress', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Build a weather app');
          const lessons = await createTestLessons(roadmap.id, 1);
          const project = await createTestProject(roadmap.id, lessons[0].id);

          await completeLessonForUser(testUser.id!, lessons[0].id);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to project and submit
          await page.goto(`/project/${project.id}`);
          const code = 'console.log("Weather App");';
          await executeCode(page, code);
          await page.click('button:has-text("Submit Project")');

          // Wait for review
          await expect(page.locator('[data-testid="code-review"]')).toBeVisible({ timeout: 20000 });

          // Mark as complete
          await page.click('button:has-text("Mark Complete")');

          // Should show completion message
          await expect(page.locator('[data-testid="project-completed"]')).toBeVisible();

          // Navigate to dashboard
          await page.goto('/dashboard');

          // Should show updated project count
          await expect(page.locator('[data-testid="projects-completed"]')).toContainText('1');

          // Should show project in completed projects list
          await expect(page.locator('[data-testid="completed-projects"]')).toContainText(project.title);
     });

     test('should display code review with specific issues and suggestions', async ({
          page,
          testUser,
          authenticatedPage
     }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn best practices');
          const lessons = await createTestLessons(roadmap.id, 1);
          const project = await createTestProject(roadmap.id, lessons[0].id);

          await completeLessonForUser(testUser.id!, lessons[0].id);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to project
          await page.goto(`/project/${project.id}`);

          // Submit code with potential issues
          const codeWithIssues = `
var x = 5;  // Using var instead of const/let
function test(){  // Missing space before brace
console.log(x)  // Missing semicolon
}
test()
    `.trim();

          await executeCode(page, codeWithIssues);
          await page.click('button:has-text("Submit Project")');

          // Wait for review
          await expect(page.locator('[data-testid="code-review"]')).toBeVisible({ timeout: 20000 });

          // Should show issues section
          await expect(page.locator('[data-testid="review-issues"]')).toBeVisible();

          // Should show suggestions section
          await expect(page.locator('[data-testid="review-suggestions"]')).toBeVisible();

          // Should show strengths section
          await expect(page.locator('[data-testid="review-strengths"]')).toBeVisible();
     });
});
