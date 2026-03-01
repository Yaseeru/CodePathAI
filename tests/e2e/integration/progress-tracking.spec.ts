import { test, expect } from '../fixtures/test-fixtures';
import { executeCode } from '../utils/test-helpers';
import {
     createTestRoadmap,
     createTestLessons,
     createTestProject,
     completeLessonForUser,
     updateUserProfile,
     updateUserProgress
} from '../setup/database-setup';

/**
 * Integration Tests: Progress Tracking
 * 
 * Tests the progress tracking system including lesson completion,
 * streak calculation, time tracking, and dashboard updates.
 */
test.describe('Progress Tracking Integration', () => {
     test('should update progress when lesson is completed', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn basics');
          const lessons = await createTestLessons(roadmap.id, 3);
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Check initial progress
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="lessons-completed"]')).toContainText('0');

          // Complete a lesson
          await page.goto(`/lesson/${lessons[0].id}`);
          await executeCode(page, 'console.log("done");');
          await page.click('button:has-text("Complete Lesson")');

          // Check updated progress
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="lessons-completed"]')).toContainText('1');
     });

     test('should calculate roadmap completion percentage', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn programming');
          const lessons = await createTestLessons(roadmap.id, 4);

          // Complete 2 out of 4 lessons
          await completeLessonForUser(testUser.id!, lessons[0].id);
          await completeLessonForUser(testUser.id!, lessons[1].id);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Check completion percentage
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="roadmap-completion"]')).toContainText('50%');
     });

     test('should track total learning time', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn coding');
          const lessons = await createTestLessons(roadmap.id, 2);

          await completeLessonForUser(testUser.id!, lessons[0].id);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          await updateUserProgress(testUser.id!, {
               total_learning_time: 45, // 45 minutes
          });

          // Check learning time display
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="total-learning-time"]')).toContainText(/45|0:45/);
     });

     test('should calculate and display current streak', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Learn daily');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          await updateUserProgress(testUser.id!, {
               current_streak: 5,
               last_activity_date: new Date().toISOString().split('T')[0],
          });

          // Check streak display
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="current-streak"]')).toContainText('5');
     });

     test('should update streak when user completes lesson', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Build streak');
          const lessons = await createTestLessons(roadmap.id, 1);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          await updateUserProgress(testUser.id!, {
               current_streak: 3,
               last_activity_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          });

          // Complete lesson today
          await page.goto(`/lesson/${lessons[0].id}`);
          await executeCode(page, 'console.log("streak");');
          await page.click('button:has-text("Complete Lesson")');

          // Check updated streak
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="current-streak"]')).toContainText('4');
     });

     test('should display project completion count', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Build projects');
          const lessons = await createTestLessons(roadmap.id, 1);
          const project = await createTestProject(roadmap.id, lessons[0].id);

          await completeLessonForUser(testUser.id!, lessons[0].id);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          await updateUserProgress(testUser.id!, {
               total_projects_completed: 1,
          });

          // Check project count
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="projects-completed"]')).toContainText('1');
     });

     test('should show recent activity feed', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Track activity');
          const lessons = await createTestLessons(roadmap.id, 2);

          await completeLessonForUser(testUser.id!, lessons[0].id);
          await completeLessonForUser(testUser.id!, lessons[1].id);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Check activity feed
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible();
          await expect(page.locator('[data-testid="activity-item"]')).toHaveCount(2, { timeout: 5000 });
     });

     test('should display streak calendar', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Visual progress');
          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to progress page
          await page.goto('/progress');

          // Should show streak calendar
          await expect(page.locator('[data-testid="streak-calendar"]')).toBeVisible();

          // Should show activity for today
          const today = new Date().toISOString().split('T')[0];
          await expect(page.locator(`[data-date="${today}"]`)).toBeVisible();
     });

     test('should update progress in real-time', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Real-time updates');
          const lessons = await createTestLessons(roadmap.id, 2);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Open dashboard in one tab
          await page.goto('/dashboard');
          const initialCount = await page.locator('[data-testid="lessons-completed"]').textContent();

          // Complete a lesson
          await page.goto(`/lesson/${lessons[0].id}`);
          await executeCode(page, 'console.log("update");');
          await page.click('button:has-text("Complete Lesson")');

          // Go back to dashboard
          await page.goto('/dashboard');

          // Count should be updated
          const updatedCount = await page.locator('[data-testid="lessons-completed"]').textContent();
          expect(updatedCount).not.toBe(initialCount);
     });

     test('should track lesson completion time', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Time tracking');
          const lessons = await createTestLessons(roadmap.id, 1);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Start lesson
          await page.goto(`/lesson/${lessons[0].id}`);

          // Wait a few seconds
          await page.waitForTimeout(3000);

          // Complete lesson
          await executeCode(page, 'console.log("timed");');
          await page.click('button:has-text("Complete Lesson")');

          // Check that time was recorded
          await page.goto('/progress');
          const lessonCard = page.locator(`[data-lesson-id="${lessons[0].id}"]`);
          await expect(lessonCard).toContainText(/\d+ min/);
     });

     test('should display progress visualization', async ({ page, testUser, authenticatedPage }) => {
          // Setup
          const roadmap = await createTestRoadmap(testUser.id!, 'Visual learning');
          const lessons = await createTestLessons(roadmap.id, 5);

          await completeLessonForUser(testUser.id!, lessons[0].id);
          await completeLessonForUser(testUser.id!, lessons[1].id);

          await updateUserProfile(testUser.id!, {
               onboarding_completed: true,
          });

          // Navigate to progress page
          await page.goto('/progress');

          // Should show progress bar
          await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();

          // Should show visual roadmap
          await expect(page.locator('[data-testid="roadmap-visualization"]')).toBeVisible();

          // Completed lessons should be marked
          await expect(page.locator('[data-testid="lesson-completed"]')).toHaveCount(2);
     });
});
