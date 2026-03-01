#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all required environment variables are set
 * before starting the application. Run this before `npm run dev` or deployment.
 * 
 * Usage: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
     reset: '\x1b[0m',
     red: '\x1b[31m',
     green: '\x1b[32m',
     yellow: '\x1b[33m',
     blue: '\x1b[34m',
     cyan: '\x1b[36m',
};

// Required environment variables
const requiredVars = [
     {
          name: 'NEXT_PUBLIC_SUPABASE_URL',
          description: 'Supabase project URL',
          example: 'https://your-project.supabase.co',
          critical: true,
     },
     {
          name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          description: 'Supabase anonymous key',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          critical: true,
     },
     {
          name: 'SUPABASE_SERVICE_ROLE_KEY',
          description: 'Supabase service role key (for admin operations)',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          critical: true,
     },
     {
          name: 'CLAUDE_API_KEY',
          description: 'Claude API key from Anthropic',
          example: 'sk-ant-api03-...',
          critical: true,
     },
     {
          name: 'PISTON_API_URL',
          description: 'Piston API URL for code execution',
          example: 'https://emkc.org/api/v2/piston',
          critical: false,
          default: 'https://emkc.org/api/v2/piston',
     },
     {
          name: 'RESEND_API_KEY',
          description: 'Resend API key for sending emails',
          example: 're_...',
          critical: true,
     },
     {
          name: 'RESEND_FROM_EMAIL',
          description: 'Email address to send from',
          example: 'noreply@yourdomain.com',
          critical: true,
     },
     {
          name: 'NEXT_PUBLIC_POSTHOG_KEY',
          description: 'PostHog project key for analytics',
          example: 'phc_...',
          critical: false,
     },
     {
          name: 'NEXT_PUBLIC_POSTHOG_HOST',
          description: 'PostHog host URL',
          example: 'https://app.posthog.com',
          critical: false,
          default: 'https://app.posthog.com',
     },
     {
          name: 'NEXT_PUBLIC_SENTRY_DSN',
          description: 'Sentry DSN for error tracking',
          example: 'https://...@sentry.io/...',
          critical: false,
     },
     {
          name: 'NEXT_PUBLIC_APP_URL',
          description: 'Application base URL',
          example: 'http://localhost:3000',
          critical: false,
          default: 'http://localhost:3000',
     },
];

// Optional environment variables
const optionalVars = [
     {
          name: 'UPSTASH_REDIS_REST_URL',
          description: 'Upstash Redis URL for rate limiting',
     },
     {
          name: 'UPSTASH_REDIS_REST_TOKEN',
          description: 'Upstash Redis token',
     },
     {
          name: 'SENTRY_AUTH_TOKEN',
          description: 'Sentry auth token for source maps',
     },
];

function log(message, color = 'reset') {
     console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
     const envPath = path.join(process.cwd(), '.env.local');

     if (!fs.existsSync(envPath)) {
          log('\n❌ ERROR: .env.local file not found!', 'red');
          log('\nPlease create a .env.local file based on .env.local.example:', 'yellow');
          log('  cp .env.local.example .env.local', 'cyan');
          log('\nThen fill in your actual credentials.\n', 'yellow');
          return false;
     }

     log('✓ .env.local file found', 'green');
     return true;
}

function validateEnvironmentVariables() {
     log('\n' + '='.repeat(60), 'blue');
     log('  Environment Variable Validation', 'blue');
     log('='.repeat(60) + '\n', 'blue');

     if (!checkEnvFile()) {
          process.exit(1);
     }

     // Load environment variables from .env.local
     require('dotenv').config({ path: '.env.local' });

     let hasErrors = false;
     let hasWarnings = false;
     const missing = [];
     const placeholder = [];
     const valid = [];

     log('Checking required variables:\n', 'cyan');

     requiredVars.forEach((varConfig) => {
          const value = process.env[varConfig.name];
          const status = value ? '✓' : '✗';
          const color = value ? 'green' : 'red';

          if (!value) {
               log(`  ${status} ${varConfig.name}`, color);
               log(`     ${varConfig.description}`, 'yellow');
               log(`     Example: ${varConfig.example}\n`, 'cyan');

               if (varConfig.critical) {
                    missing.push(varConfig);
                    hasErrors = true;
               } else {
                    hasWarnings = true;
               }
          } else if (value.includes('placeholder') || value.includes('your_')) {
               log(`  ⚠ ${varConfig.name}`, 'yellow');
               log(`     Contains placeholder value - replace with actual credentials`, 'yellow');
               log(`     Example: ${varConfig.example}\n`, 'cyan');
               placeholder.push(varConfig);

               if (varConfig.critical) {
                    hasErrors = true;
               } else {
                    hasWarnings = true;
               }
          } else {
               log(`  ${status} ${varConfig.name}`, color);
               valid.push(varConfig);
          }
     });

     log('\nChecking optional variables:\n', 'cyan');

     optionalVars.forEach((varConfig) => {
          const value = process.env[varConfig.name];
          const status = value ? '✓' : '○';
          const color = value ? 'green' : 'yellow';

          log(`  ${status} ${varConfig.name}`, color);
          if (!value) {
               log(`     ${varConfig.description} (optional)\n`, 'yellow');
          }
     });

     // Summary
     log('\n' + '='.repeat(60), 'blue');
     log('  Summary', 'blue');
     log('='.repeat(60) + '\n', 'blue');

     log(`Valid: ${valid.length}`, 'green');
     log(`Missing: ${missing.length}`, missing.length > 0 ? 'red' : 'green');
     log(`Placeholder: ${placeholder.length}`, placeholder.length > 0 ? 'yellow' : 'green');

     if (hasErrors) {
          log('\n❌ CRITICAL: Application cannot start with missing or placeholder values!', 'red');
          log('\nPlease update your .env.local file with actual credentials:', 'yellow');
          log('  1. Get Supabase credentials from: https://supabase.com/dashboard', 'cyan');
          log('  2. Get Claude API key from: https://console.anthropic.com/', 'cyan');
          log('  3. Get Resend API key from: https://resend.com/api-keys', 'cyan');
          log('\nAfter updating, run this script again to validate.\n', 'yellow');
          process.exit(1);
     }

     if (hasWarnings) {
          log('\n⚠ WARNING: Some optional variables are not set.', 'yellow');
          log('The application will start, but some features may not work.\n', 'yellow');
     }

     if (!hasErrors && !hasWarnings) {
          log('\n✅ All environment variables are properly configured!', 'green');
          log('You can now start the application with: npm run dev\n', 'cyan');
     }

     process.exit(hasErrors ? 1 : 0);
}

// Run validation
try {
     validateEnvironmentVariables();
} catch (error) {
     log('\n❌ Error during validation:', 'red');
     console.error(error);
     process.exit(1);
}
