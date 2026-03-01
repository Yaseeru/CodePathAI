/**
 * User-Facing Success Messages
 * Centralized success message mapping
 */

export interface SuccessMessage {
     title: string;
     message: string;
     action?: string;
}

/**
 * Authentication success messages
 */
export const authSuccess = {
     login: {
          title: 'Welcome Back!',
          message: 'You've successfully logged in.',
     },
     register: {
          title: 'Account Created!',
          message: 'Your account has been created successfully.',
          action: 'Let's set up your learning path.',
     },
     logout: {
          title: 'Logged Out',
          message: 'You've been logged out successfully.',
     },
     passwordReset: {
          title: 'Password Reset Email Sent',
          message: 'Check your email for instructions to reset your password.',
     },
     passwordChanged: {
          title: 'Password Changed',
          message: 'Your password has been updated successfully.',
     },
};

/**
 * Onboarding success messages
 */
export const onboardingSuccess = {
     completed: {
          title: 'Onboarding Complete!',
          message: 'Your personalized learning roadmap is ready.',
          action: 'Start your first lesson.',
     },
     goalUpdated: {
          title: 'Goal Updated',
          message: 'Your learning goal has been updated.',
     },
};

/**
 * Lesson success messages
 */
export const lessonSuccess = {
     completed: {
          title: 'Lesson Complete! 🎉',
          message: 'Great job! You've completed this lesson.',
          action: 'Continue to the next lesson.',
     },
     codeExecuted: {
          title: 'Code Executed Successfully',
          message: 'Your code ran without errors.',
     },
     codeSaved: {
          title: 'Code Saved',
          message: 'Your code has been saved automatically.',
     },
};

/**
 * Project success messages
 */
export const projectSuccess = {
     submitted: {
          title: 'Project Submitted! 🚀',
          message: 'Your project has been submitted for review.',
          action: 'Check back soon for feedback.',
     },
     approved: {
          title: 'Project Approved! ⭐',
          message: 'Congratulations! Your project meets all requirements.',
          action: 'Continue to the next project.',
     },
};

/**
 * Roadmap success messages
 */
export const roadmapSuccess = {
     generated: {
          title: 'Roadmap Generated! 🗺️',
          message: 'Your personalized learning roadmap is ready.',
          action: 'Start your learning journey.',
     },
     pivoted: {
          title: 'New Roadmap Created',
          message: 'Your learning path has been updated with your new goal.',
          action: 'Explore your new roadmap.',
     },
};

/**
 * Settings success messages
 */
export const settingsSuccess = {
     profileUpdated: {
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.',
     },
     preferencesUpdated: {
          title: 'Preferences Saved',
          message: 'Your preferences have been updated.',
     },
};

/**
 * Get success message by code
 */
export function getSuccessMessage(successCode: string): SuccessMessage {
     const successMap: Record<string, SuccessMessage> = {
          // Auth
          'auth/login': authSuccess.login,
          'auth/register': authSuccess.register,
          'auth/logout': authSuccess.logout,
          'auth/password-reset': authSuccess.passwordReset,
          'auth/password-changed': authSuccess.passwordChanged,

          // Onboarding
          'onboarding/completed': onboardingSuccess.completed,
          'onboarding/goal-updated': onboardingSuccess.goalUpdated,

          // Lessons
          'lesson/completed': lessonSuccess.completed,
          'lesson/code-executed': lessonSuccess.codeExecuted,
          'lesson/code-saved': lessonSuccess.codeSaved,

          // Projects
          'project/submitted': projectSuccess.submitted,
          'project/approved': projectSuccess.approved,

          // Roadmap
          'roadmap/generated': roadmapSuccess.generated,
          'roadmap/pivoted': roadmapSuccess.pivoted,

          // Settings
          'settings/profile-updated': settingsSuccess.profileUpdated,
          'settings/preferences-updated': settingsSuccess.preferencesUpdated,
     };

     return successMap[successCode] || {
          title: 'Success',
          message: 'Operation completed successfully.',
     };
}
