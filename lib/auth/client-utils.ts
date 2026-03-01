/**
 * Client-safe authentication utilities
 * These functions can be used in both client and server components
 */

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with isValid and strength score (0-4)
 */
export function validatePasswordStrength(password: string): {
     isValid: boolean;
     strength: number;
     feedback: string[];
} {
     const feedback: string[] = [];
     let strength = 0;

     // Check length
     if (password.length < 8) {
          feedback.push('Password must be at least 8 characters');
          return { isValid: false, strength: 0, feedback };
     }

     // Check for lowercase
     if (/[a-z]/.test(password)) {
          strength++;
     } else {
          feedback.push('Add lowercase letters');
     }

     // Check for uppercase
     if (/[A-Z]/.test(password)) {
          strength++;
     } else {
          feedback.push('Add uppercase letters');
     }

     // Check for numbers
     if (/\d/.test(password)) {
          strength++;
     } else {
          feedback.push('Add numbers');
     }

     // Check for special characters
     if (/[^A-Za-z0-9]/.test(password)) {
          strength++;
     } else {
          feedback.push('Add special characters');
     }

     return {
          isValid: strength >= 3,
          strength,
          feedback: feedback.length > 0 ? feedback : ['Strong password'],
     };
}
