/**
 * User-Facing Error Messages
 * Centralized error message mapping with actionable guidance
 */

export interface UserMessage {
     title: string;
     message: string;
     action?: string;
     severity: 'error' | 'warning' | 'info';
}

/**
 * Authentication error messages
 */
export const authErrors = {
     invalidCredentials: {
          title: 'Login Failed',
          message: 'The email or password you entered is incorrect.',
          action: 'Please check your credentials and try again.',
          severity: 'error' as const,
     },
     emailAlreadyExists: {
          title: 'Email Already Registered',
          message: 'An account with this email already exists.',
          action: 'Try logging in or use a different email address.',
          severity: 'error' as const,
     },
     weakPassword: {
          title: 'Weak Password',
          message: 'Your password is too weak.',
          action: 'Use at least 8 characters with a mix of letters, numbers, and symbols.',
          severity: 'error' as const,
     },
     sessionExpired: {
          title: 'Session Expired',
          message: 'Your session has expired for security reasons.',
          action: 'Please log in again to continue.',
          severity: 'warning' as const,
     },
     unauthorized: {
          title: 'Access Denied',
          message: "You don't have permission to access this resource.",
          action: 'Log in with an authorized account or contact support.',
          severity: 'error' as const,
     },
};

/**
 * Network error messages
 */
export const networkErrors = {
     offline: {
          title: 'No Internet Connection',
          message: "You're currently offline.",
          action: 'Check your internet connection and try again.',
          severity: 'error' as const,
     },
     timeout: {
          title: 'Request Timeout',
          message: 'The request took too long to complete.',
          action: 'Check your connection and try again.',
          severity: 'error' as const,
     },
     serverError: {
          title: 'Server Error',
          message: 'Our servers are experiencing issues.',
          action: 'Please try again in a few moments.',
          severity: 'error' as const,
     },
     rateLimited: {
          title: 'Too Many Requests',
          message: "You've made too many requests in a short time.",
          action: 'Please wait a moment before trying again.',
          severity: 'warning' as const,
     },
};

/**
 * AI service error messages
 */
export const aiErrors = {
     claudeUnavailable: {
          title: 'AI Mentor Unavailable',
          message: 'Our AI mentor is temporarily unavailable.',
          action: 'Please try again in a few moments.',
          severity: 'error' as const,
     },
     claudeTimeout: {
          title: 'AI Response Timeout',
          message: 'The AI took too long to respond.',
          action: 'Try asking a simpler question or try again.',
          severity: 'error' as const,
     },
     roadmapGenerationFailed: {
          title: 'Roadmap Generation Failed',
          message: 'We couldn't generate your learning roadmap.',
          action: 'Please try again or contact support if the issue persists.',
          severity: 'error' as const,
     },
     codeReviewFailed: {
          title: 'Code Review Failed',
          message: 'We couldn't review your code at this time.',
          action: 'Try submitting again or continue with your lesson.',
          severity: 'error' as const,
     },
};

/**
 * Code execution error messages
 */
export const codeErrors = {
     executionFailed: {
          title: 'Code Execution Failed',
          message: 'Your code couldn't be executed.',
          action: 'Check for syntax errors and try again.',
          severity: 'error' as const,
     },
     executionTimeout: {
          title: 'Execution Timeout',
          message: 'Your code took too long to run.',
          action: 'Optimize your code or reduce the input size.',
          severity: 'error' as const,
     },
     pistonUnavailable: {
          title: 'Code Executor Unavailable',
          message: 'The code execution service is temporarily unavailable.',
          action: 'Please try again in a few moments.',
          severity: 'error' as const,
     },
     codeTooLarge: {
          title: 'Code Too Large',
          message: 'Your code exceeds the maximum size limit.',
          action: 'Reduce your code size and try again.',
          severity: 'error' as const,
     },
};

/**
 * Validation error messages
 */
export const validationErrors = {
     requiredField: (fieldName: string): UserMessage => ({
          title: 'Required Field',
          message: `${fieldName} is required.`,
          action: 'Please fill in this field.',
          severity: 'error',
     }),
     invalidEmail: {
          title: 'Invalid Email',
          message: 'Please enter a valid email address.',
          action: 'Check your email format (e.g., user@example.com).',
          severity: 'error' as const,
     },
     passwordMismatch: {
          title: 'Passwords Don\'t Match',
          message: 'The passwords you entered don\'t match.',
          action: 'Make sure both password fields are identical.',
          severity: 'error' as const,
     },
     invalidInput: (fieldName: string): UserMessage => ({
          title: 'Invalid Input',
          message: `The ${fieldName} you entered is invalid.`,
          action: 'Please check your input and try again.',
          severity: 'error',
     }),
};

/**
 * Database error messages
 */
export const databaseErrors = {
     notFound: (resource: string): UserMessage => ({
          title: 'Not Found',
          message: `The ${resource} you're looking for doesn't exist.`,
          action: 'Go back and try again.',
          severity: 'error',
     }),
     saveFailed: {
          title: 'Save Failed',
          message: 'We couldn't save your changes.',
          action: 'Please try again or contact support.',
          severity: 'error' as const,
     },
     loadFailed: {
          title: 'Load Failed',
          message: 'We couldn't load the requested data.',
          action: 'Refresh the page or try again later.',
          severity: 'error' as const,
     },
};

/**
 * Generic error messages
 */
export const genericErrors = {
     unknown: {
          title: 'Something Went Wrong',
          message: 'An unexpected error occurred.',
          action: 'Please try again or contact support if the issue persists.',
          severity: 'error' as const,
     },
     maintenance: {
          title: 'Maintenance Mode',
          message: 'CodePath AI is currently undergoing maintenance.',
          action: 'Please check back in a few minutes.',
          severity: 'info' as const,
     },
};

/**
 * Get error message by code
 */
export function getErrorMessage(errorCode: string): UserMessage {
     const errorMap: Record<string, UserMessage> = {
          // Auth
          'auth/invalid-credentials': authErrors.invalidCredentials,
          'auth/email-exists': authErrors.emailAlreadyExists,
          'auth/weak-password': authErrors.weakPassword,
          'auth/session-expired': authErrors.sessionExpired,
          'auth/unauthorized': authErrors.unauthorized,

          // Network
          'network/offline': networkErrors.offline,
          'network/timeout': networkErrors.timeout,
          'network/server-error': networkErrors.serverError,
          'network/rate-limited': networkErrors.rateLimited,

          // AI
          'ai/claude-unavailable': aiErrors.claudeUnavailable,
          'ai/claude-timeout': aiErrors.claudeTimeout,
          'ai/roadmap-failed': aiErrors.roadmapGenerationFailed,
          'ai/review-failed': aiErrors.codeReviewFailed,

          // Code
          'code/execution-failed': codeErrors.executionFailed,
          'code/execution-timeout': codeErrors.executionTimeout,
          'code/piston-unavailable': codeErrors.pistonUnavailable,
          'code/too-large': codeErrors.codeTooLarge,

          // Validation
          'validation/invalid-email': validationErrors.invalidEmail,
          'validation/password-mismatch': validationErrors.passwordMismatch,

          // Database
          'db/save-failed': databaseErrors.saveFailed,
          'db/load-failed': databaseErrors.loadFailed,
     };

     return errorMap[errorCode] || genericErrors.unknown;
}
