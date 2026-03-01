/**
 * Password validation utilities
 */

export interface PasswordStrength {
     score: number; // 0-4
     feedback: string[];
     isStrong: boolean;
}

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Contains special character
 */
export function validatePasswordStrength(password: string): PasswordStrength {
     const feedback: string[] = [];
     let score = 0;

     // Length check
     if (password.length >= 8) {
          score++;
     } else {
          feedback.push('Password must be at least 8 characters long');
     }

     if (password.length >= 12) {
          score++;
     }

     // Uppercase check
     if (/[A-Z]/.test(password)) {
          score++;
     } else {
          feedback.push('Add at least one uppercase letter');
     }

     // Lowercase check
     if (/[a-z]/.test(password)) {
          score++;
     } else {
          feedback.push('Add at least one lowercase letter');
     }

     // Number check
     if (/\d/.test(password)) {
          score++;
     } else {
          feedback.push('Add at least one number');
     }

     // Special character check
     if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
          score++;
     } else {
          feedback.push('Add at least one special character');
     }

     // Common patterns check
     const commonPatterns = [
          /^123456/,
          /^password/i,
          /^qwerty/i,
          /^abc123/i,
          /^111111/,
     ];

     for (const pattern of commonPatterns) {
          if (pattern.test(password)) {
               feedback.push('Avoid common password patterns');
               score = Math.max(0, score - 2);
               break;
          }
     }

     // Normalize score to 0-4 range
     const normalizedScore = Math.min(4, Math.max(0, Math.floor(score / 1.5)));

     return {
          score: normalizedScore,
          feedback,
          isStrong: normalizedScore >= 3 && feedback.length === 0,
     };
}

/**
 * Gets a human-readable strength label
 */
export function getPasswordStrengthLabel(score: number): string {
     switch (score) {
          case 0:
          case 1:
               return 'Weak';
          case 2:
               return 'Fair';
          case 3:
               return 'Good';
          case 4:
               return 'Strong';
          default:
               return 'Unknown';
     }
}
