# Implementation Plan: CodePath AI MVP

## Overview

This implementation plan breaks down the CodePath AI MVP into actionable coding tasks aligned with a 12-week development timeline. The plan follows an incremental approach where each task builds on previous work, with checkpoints to ensure quality and gather user feedback.

The implementation is organized into 5 major phases:
1. Foundation & Infrastructure (Weeks 1-2)
2. Core Learning Loop (Weeks 3-6)
3. Depth & Retention Features (Weeks 7-10)
4. Testing & Quality Assurance (Throughout)
5. Performance & Launch Preparation (Weeks 11-12)

## Tasks

### Phase 1: Foundation & Infrastructure (Weeks 1-2)

- [x] 1. Initialize Next.js 15 project with TypeScript and core dependencies
  - Create Next.js 15 project with App Router
  - Install dependencies: React 19, Tailwind CSS, TypeScript, Supabase client, Zod, SWR
  - Configure TypeScript with strict mode
  - Set up Tailwind CSS with custom theme (colors, fonts, spacing)
  - Create base layout component with navigation structure
  - Configure environment variables structure (.env.local.example)
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 2. Set up Supabase project and configure authentication
  - [x] 2.1 Create Supabase project and configure connection
    - Create new Supabase project
    - Configure Supabase client in lib/supabase.ts
    - Set up environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
    - Create authentication utilities (getUser, getSession)
    - _Requirements: 1.1, 16.1_

  - [x] 2.2 Implement email/password authentication
    - Create auth API routes (/api/auth/register, /api/auth/login, /api/auth/logout)
    - Implement registration with bcrypt password hashing (10+ salt rounds)
    - Implement login with session management
    - Set up httpOnly cookies for JWT tokens
    - _Requirements: 1.1, 1.2, 16.2_

  - [ ]* 2.3 Write property test for authentication round-trip
    - **Property 2: Authentication round-trip**
    - **Validates: Requirements 1.2**

  - [x] 2.4 Create authentication UI components
    - Build LoginForm component with validation
    - Build RegisterForm component with password strength indicator
    - Build ResetPasswordForm component
    - Add form validation with Zod schemas
    - Implement error display for auth failures
    - _Requirements: 1.2, 19.2_

  - [ ]* 2.5 Write unit tests for authentication components
    - Test form validation logic
    - Test error handling for invalid credentials
    - Test successful authentication flow
    - _Requirements: 1.2_


- [x] 3. Implement database schema and Row Level Security policies
  - [x] 3.1 Create core database tables
    - Create user_profiles table with indexes
    - Create roadmaps table with user_id foreign key
    - Create lessons table with roadmap_id foreign key and JSONB content
    - Create projects table with roadmap_id foreign key
    - Create lesson_progress table with composite unique constraint
    - Create project_submissions table
    - Create user_progress table
    - _Requirements: 1.3, 1.4, 3.1, 5.1, 8.1_

  - [x] 3.2 Create AI interaction tables
    - Create conversations table
    - Create messages table with conversation_id foreign key
    - Create code_saves table with lesson_id and project_id foreign keys
    - Add indexes for common query patterns
    - _Requirements: 4.1, 6.1, 8.3_

  - [x] 3.3 Create analytics and tracking tables
    - Create user_events table for event tracking
    - Create daily_activity table with unique constraint on user_id + date
    - Add indexes for time-based queries
    - _Requirements: 17.1, 17.7_

  - [x] 3.4 Implement Row Level Security policies
    - Create RLS policies for user_profiles (users can only access own profile)
    - Create RLS policies for roadmaps (users can only access own roadmaps)
    - Create RLS policies for lessons (users can view lessons from own roadmaps)
    - Create RLS policies for lesson_progress, messages, code_saves
    - Enable RLS on all tables
    - _Requirements: 16.5_

  - [ ]* 3.5 Write property test for data access isolation
    - **Property 53: Data access isolation**
    - **Validates: Requirements 16.5**

  - [ ]* 3.6 Write property test for registration profile creation
    - **Property 1: Registration creates complete user profile**
    - **Validates: Requirements 1.1, 1.3, 1.4**

- [x] 4. Set up external service integrations
  - [x] 4.1 Configure Claude API integration
    - Create ClaudeService class in lib/ai/claude.ts
    - Implement chat() method with context enrichment
    - Implement streamChat() method for real-time responses
    - Add error handling for rate limits, timeouts, service outages
    - Configure retry logic with exponential backoff
    - _Requirements: 4.1, 15.1, 19.4_

  - [x] 4.2 Configure Piston API integration
    - Create CodeExecutionService class in lib/code/executor.ts
    - Implement execute() method with language mapping
    - Add code sanitization for dangerous patterns
    - Implement timeout handling (30 second max)
    - Add code size validation (50KB max)
    - Parse execution results into ExecutionResult type
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 4.3 Set up Resend email service
    - Configure Resend client with API key
    - Create email templates for re-engagement
    - Implement sendReengagementEmail() function
    - Add email tracking (sent, opened, clicked)
    - _Requirements: 12.1, 12.6_

  - [x] 4.4 Configure monitoring services
    - Set up Sentry for error tracking
    - Configure PostHog for analytics
    - Add error boundary components
    - Implement error logging utility
    - _Requirements: 15.6, 17.8_

  - [ ]* 4.5 Write unit tests for external service error handling
    - Test Claude API rate limit handling
    - Test Piston API timeout handling
    - Test network failure retry logic
    - _Requirements: 15.1, 15.3_

- [x] 5. Checkpoint - Foundation complete
  - Ensure all tests pass, ask the user if questions arise.


### Phase 2: Core Learning Loop (Weeks 3-6)

- [x] 6. Implement onboarding flow
  - [x] 6.1 Create onboarding UI components
    - Build OnboardingFlow component with multi-step wizard
    - Create GoalInput component with character counter and validation
    - Create TimeCommitmentSelector component
    - Create ExperienceLevelSelector component
    - Add progress indicator showing current step
    - Implement navigation (next, previous, skip)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 6.2 Implement onboarding data persistence
    - Create API route POST /api/onboarding/submit
    - Update user_profiles with onboarding data
    - Set onboarding_completed flag to true
    - Validate all required fields before submission
    - _Requirements: 2.7_

  - [ ]* 6.3 Write property test for onboarding data persistence
    - **Property 4: Onboarding data persistence**
    - **Validates: Requirements 2.7**

  - [x] 6.4 Implement onboarding-based routing
    - Create middleware to check onboarding status
    - Redirect incomplete users to /onboarding
    - Allow access to protected routes for completed users
    - _Requirements: 1.5, 2.6_

  - [ ]* 6.5 Write property test for onboarding-based routing
    - **Property 3: Onboarding-based routing**
    - **Validates: Requirements 1.5, 2.6**

  - [ ]* 6.6 Write unit tests for onboarding components
    - Test form validation
    - Test step navigation
    - Test data submission
    - _Requirements: 2.1, 2.7_

- [x] 7. Implement AI roadmap generation
  - [x] 7.1 Create roadmap generation prompt template
    - Build PromptTemplateService class
    - Create roadmap generation system prompt
    - Implement context enrichment for roadmap requests
    - Define JSON output schema for roadmap structure
    - _Requirements: 3.1, 3.2_

  - [x] 7.2 Implement roadmap generation API
    - Create POST /api/ai/generate-roadmap endpoint
    - Validate input (goal length, time commitment range, experience level)
    - Call Claude API with enriched prompt
    - Parse and validate JSON response
    - Handle generation errors and retries
    - _Requirements: 3.1, 3.4, 15.3_

  - [x] 7.3 Save generated roadmap to database
    - Insert roadmap record with user_id
    - Insert lessons with order_index and prerequisites
    - Insert projects with unlock conditions
    - Create initial lesson_progress records (status: not_started)
    - Update user_progress with current_roadmap_id
    - _Requirements: 3.5, 5.1_

  - [ ]* 7.4 Write property test for roadmap persistence
    - **Property 6: Roadmap persistence**
    - **Validates: Requirements 3.1, 3.5**

  - [ ]* 7.5 Write property test for prerequisite ordering
    - **Property 5: Roadmap prerequisite ordering**
    - **Validates: Requirements 3.3**

  - [ ]* 7.6 Write property test for lesson duration constraints
    - **Property 7: Lesson duration constraints**
    - **Validates: Requirements 3.7, 5.3**

  - [ ]* 7.7 Write property test for minimum project count
    - **Property 8: Minimum project count**
    - **Validates: Requirements 8.1**

  - [ ]* 7.8 Write unit tests for roadmap generation
    - Test JSON parsing and validation
    - Test error handling for invalid responses
    - Test prerequisite validation
    - _Requirements: 3.1, 3.3_


- [x] 8. Build roadmap visualization components
  - [x] 8.1 Create RoadmapView component
    - Build vertical timeline layout
    - Display lessons with completion status (completed, current, locked)
    - Show project milestones with special styling
    - Add estimated time per lesson
    - Implement click navigation to unlocked lessons
    - _Requirements: 3.6, 5.7_

  - [x] 8.2 Create LessonCard component
    - Display lesson title, duration, difficulty
    - Show completion checkmark for completed lessons
    - Highlight current lesson
    - Gray out locked lessons
    - Add prerequisite indicators
    - _Requirements: 3.6_

  - [x] 8.3 Create ProjectMilestone component
    - Display project name and description
    - Show completion percentage
    - List deliverables
    - Add unlock status indicator
    - _Requirements: 8.1, 8.2_

  - [ ]* 8.4 Write unit tests for roadmap components
    - Test lesson status rendering
    - Test navigation behavior
    - Test locked lesson interaction
    - _Requirements: 3.6, 5.7_

- [x] 9. Implement Monaco code editor integration
  - [x] 9.1 Create CodeEditor component
    - Integrate Monaco Editor with Next.js (dynamic import, ssr: false)
    - Configure syntax highlighting for JavaScript, Python, HTML
    - Add auto-completion support
    - Implement line numbers and minimap
    - Add error squiggles for syntax errors
    - Configure keyboard shortcuts (Ctrl+S save, Ctrl+Enter run)
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 9.2 Implement code auto-save functionality
    - Create POST /api/code/save endpoint
    - Implement auto-save every 30 seconds
    - Save code with lesson_id or project_id
    - Add visual indicator for save status
    - Handle save errors gracefully
    - _Requirements: 6.5_

  - [ ]* 9.3 Write property test for code persistence round-trip
    - **Property 17: Code persistence round-trip**
    - **Validates: Requirements 6.5, 6.6**

  - [x] 9.4 Create CodeOutput component
    - Display stdout with monospace font
    - Display stderr with error styling
    - Show execution time
    - Highlight error line numbers
    - Add clear output button
    - _Requirements: 7.5, 7.6_

  - [x] 9.5 Create CodeControls component
    - Add Run button with loading state
    - Add Stop button (for long-running code)
    - Add Clear Output button
    - Add Reset Code button (restore starter code)
    - Show execution time counter
    - _Requirements: 7.1_

  - [ ]* 9.6 Write unit tests for code editor components
    - Test auto-save timing
    - Test keyboard shortcuts
    - Test code restoration
    - _Requirements: 6.5, 6.6_

- [x] 10. Implement code execution system
  - [x] 10.1 Create code execution API endpoint
    - Create POST /api/code/execute endpoint
    - Validate code size (max 50KB)
    - Sanitize code for dangerous patterns
    - Call Piston API with language mapping
    - Parse execution results (stdout, stderr, exit code, time)
    - Handle timeouts (30 second max)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 10.2 Write property test for multi-language support
    - **Property 18: Multi-language support**
    - **Validates: Requirements 7.4**

  - [ ]* 10.3 Write property test for execution result structure
    - **Property 19: Execution result structure**
    - **Validates: Requirements 7.8**

  - [ ]* 10.4 Write property test for execution error line numbers
    - **Property 20: Execution error line numbers**
    - **Validates: Requirements 7.6**

  - [x] 10.2 Implement execution error parsing
    - Parse syntax errors with line numbers
    - Parse runtime errors with stack traces
    - Detect timeout errors
    - Detect resource limit errors
    - Format errors for user display
    - _Requirements: 7.6, 19.3_

  - [ ]* 10.6 Write unit tests for error parsing
    - Test JavaScript error parsing
    - Test Python error parsing
    - Test timeout detection
    - _Requirements: 7.6_

- [x] 11. Checkpoint - Code execution working
  - Ensure all tests pass, ask the user if questions arise.


- [x] 12. Build lesson engine and content display
  - [x] 12.1 Create LessonContent component
    - Render lesson title and description
    - Display learning objectives list
    - Render markdown content with syntax highlighting
    - Display code examples with proper formatting
    - Show exercises with starter code
    - Add image support with Next.js Image optimization
    - _Requirements: 5.2, 18.2, 18.3_

  - [ ]* 12.2 Write property test for lesson content structure
    - **Property 16: Lesson content structure**
    - **Validates: Requirements 5.2**

  - [ ]* 12.3 Write property test for lesson content structure validation
    - **Property 64: Lesson content structure validation**
    - **Validates: Requirements 18.1**

  - [x] 12.4 Create LessonTimer component
    - Display timer in MM:SS format
    - Show visual progress bar
    - Color code based on time (green < 15min, yellow < 20min, red > 20min)
    - Add pause/resume functionality
    - Track total time spent
    - _Requirements: 5.3_

  - [x] 12.5 Create LessonProgress component
    - Show progress bar with percentage
    - Display step indicators
    - Highlight current step
    - Show completed steps with checkmarks
    - _Requirements: 5.5_

  - [x] 12.6 Implement lesson page layout
    - Create /app/lesson/[id]/page.tsx
    - Fetch lesson data with Supabase
    - Load saved code from code_saves
    - Integrate LessonContent, CodeEditor, CodeOutput, LessonTimer
    - Add split-pane layout (content left, editor right)
    - Make layout responsive for mobile
    - _Requirements: 5.1, 5.2, 6.6, 14.1_

  - [ ]* 12.7 Write property test for starter code loading
    - **Property 67: Starter code loading**
    - **Validates: Requirements 18.4**

  - [ ]* 12.8 Write unit tests for lesson components
    - Test timer functionality
    - Test progress calculation
    - Test markdown rendering
    - _Requirements: 5.2, 5.3_

- [x] 13. Implement lesson progress tracking
  - [x] 13.1 Create lesson start tracking
    - Create POST /api/lessons/:id/start endpoint
    - Insert lesson_progress record with started_at timestamp
    - Update status to 'in_progress'
    - Update user_progress.current_lesson_id
    - _Requirements: 5.4_

  - [ ]* 13.2 Write property test for lesson start timestamp
    - **Property 12: Lesson start timestamp recording**
    - **Validates: Requirements 5.4**

  - [x] 13.3 Create lesson completion tracking
    - Create POST /api/lessons/:id/complete endpoint
    - Update lesson_progress status to 'completed'
    - Record completed_at timestamp and completion_time
    - Increment user_progress.total_lessons_completed
    - Update user_progress.total_learning_time
    - Update daily_activity for current date
    - Return next lesson in roadmap
    - _Requirements: 5.6, 10.1_

  - [ ]* 13.4 Write property test for lesson completion state transition
    - **Property 13: Lesson completion state transition**
    - **Validates: Requirements 5.6**

  - [ ]* 13.5 Write property test for sequential lesson unlocking
    - **Property 14: Sequential lesson unlocking**
    - **Validates: Requirements 5.7**

  - [x] 13.6 Implement lesson pause/resume
    - Save current state (code, scroll position, timer) on pause
    - Restore exact state on resume
    - Update lesson_progress.updated_at on state changes
    - _Requirements: 5.8_

  - [ ]* 13.7 Write property test for lesson pause-resume state preservation
    - **Property 15: Lesson pause-resume state preservation**
    - **Validates: Requirements 5.8**

  - [ ]* 13.8 Write unit tests for progress tracking
    - Test completion time calculation
    - Test next lesson retrieval
    - Test daily activity updates
    - _Requirements: 5.6, 10.1_


- [x] 14. Implement context-aware AI mentor chat
  - [x] 14.1 Create AI context enrichment system
    - Build buildAIContext() function to gather user context
    - Fetch user profile (name, goal, experience level)
    - Fetch current lesson content
    - Fetch recent progress (last 10 lessons)
    - Fetch conversation history (last 10 messages)
    - Fetch recent code submissions (last 3)
    - Fetch current difficulty level
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 14.2 Write property test for AI context completeness
    - **Property 9: AI context completeness**
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [x] 14.3 Create chat prompt templates
    - Create base AI mentor system prompt
    - Add context injection placeholders
    - Create code review prompt template
    - Create debugging help prompt template
    - Implement PromptTemplateService.buildPrompt()
    - _Requirements: 4.1_

  - [x] 14.4 Implement streaming chat API
    - Create POST /api/ai/chat endpoint
    - Enrich context before sending to Claude
    - Implement streaming response with ReadableStream
    - Save messages to database (user and assistant)
    - Save context snapshot with each message
    - Handle rate limits and errors
    - _Requirements: 4.1, 4.5, 15.1_

  - [ ]* 14.5 Write property test for message persistence
    - **Property 10: Message persistence**
    - **Validates: Requirements 4.6**

  - [ ]* 14.6 Write property test for message chronological ordering
    - **Property 11: Message chronological ordering**
    - **Validates: Requirements 4.7**

  - [x] 14.7 Create ChatInterface component
    - Build chat container with message history
    - Add typing indicators during streaming
    - Implement auto-scroll to latest message
    - Show context badge (current lesson)
    - Add "Ask AI for help" quick actions
    - _Requirements: 4.1, 4.8_

  - [x] 14.8 Create MessageList component
    - Differentiate user vs AI messages with styling
    - Display timestamps
    - Render code blocks with syntax highlighting
    - Support markdown formatting
    - Implement virtualization for long histories
    - _Requirements: 4.7_

  - [x] 14.9 Create MessageInput component
    - Multi-line text input
    - Character counter
    - Send on Enter (Shift+Enter for new line)
    - Detect and format pasted code
    - Disable during AI response
    - _Requirements: 4.1_

  - [ ]* 14.10 Write unit tests for chat components
    - Test message rendering
    - Test streaming updates
    - Test code block formatting
    - _Requirements: 4.1, 4.7_

- [x] 15. Checkpoint - Core learning loop complete
  - Ensure all tests pass, ask the user if questions arise.


- [x] 16. Implement build-as-you-learn projects
  - [x] 16.1 Create project workspace UI
    - Build project page layout (/app/project/[id]/page.tsx)
    - Display project title, description, requirements
    - Show success criteria checklist
    - Integrate CodeEditor for project code
    - Add project-specific code save functionality
    - Show completion percentage
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ]* 16.2 Write property test for project requirements display
    - **Property 21: Project requirements display**
    - **Validates: Requirements 8.2**

  - [x] 16.3 Implement project code persistence
    - Create POST /api/projects/:id/save endpoint
    - Save code with project_id and user_id
    - Track save timestamps
    - Support multiple file saves per project
    - _Requirements: 8.3_

  - [ ]* 16.4 Write property test for project code persistence
    - **Property 22: Project code persistence**
    - **Validates: Requirements 8.3, 8.5**

  - [x] 16.5 Create project submission system
    - Create POST /api/projects/:id/submit endpoint
    - Insert project_submissions record
    - Trigger AI code review automatically
    - Update project status to 'submitted'
    - _Requirements: 8.6, 9.1_

  - [ ]* 16.6 Write property test for project completion linkage
    - **Property 23: Project completion linkage**
    - **Validates: Requirements 8.6**

  - [ ]* 16.7 Write unit tests for project components
    - Test requirements display
    - Test code save functionality
    - Test submission flow
    - _Requirements: 8.2, 8.3, 8.6_

### Phase 3: Depth & Retention Features (Weeks 7-10)

- [x] 17. Implement AI code review system
  - [x] 17.1 Create code review prompt template
    - Build code review system prompt
    - Include evaluation criteria (correctness, quality, best practices)
    - Define JSON output schema for CodeReview
    - Add context about learner's experience level
    - _Requirements: 9.1, 9.2_

  - [x] 17.2 Implement code review API
    - Create POST /api/ai/review-code endpoint
    - Validate code input
    - Enrich context with lesson objectives
    - Call Claude API with code review prompt
    - Parse and validate JSON response
    - Save review to project_submissions.review_feedback
    - _Requirements: 9.1, 9.3_

  - [ ]* 17.3 Write property test for code review generation
    - **Property 24: Code review generation**
    - **Validates: Requirements 9.1**

  - [ ]* 17.4 Write property test for code review issue structure
    - **Property 25: Code review issue structure**
    - **Validates: Requirements 9.4**

  - [x] 17.5 Create CodeReview display component
    - Show overall feedback and score
    - List strengths with positive styling
    - Display issues grouped by severity
    - Show suggestions with actionable steps
    - Add "Ask AI about this" buttons for each issue
    - _Requirements: 9.2, 9.3, 9.4_

  - [ ]* 17.6 Write unit tests for code review
    - Test JSON parsing
    - Test issue severity handling
    - Test review display
    - _Requirements: 9.1, 9.2_


- [x] 18. Build progress dashboard
  - [x] 18.1 Create ProgressDashboard component
    - Display learning goal prominently
    - Show roadmap completion percentage with progress bar
    - Display lessons completed count
    - Display projects completed count
    - Show total learning time (formatted as hours/minutes)
    - Display current streak with fire icon
    - Show recent activity feed (last 7 days)
    - Add "Continue Learning" CTA button
    - Add "Change Goal" button
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 18.2 Write property test for roadmap completion accuracy
    - **Property 26: Roadmap completion accuracy**
    - **Validates: Requirements 10.2**

  - [ ]* 18.3 Write property test for lesson count accuracy
    - **Property 27: Lesson count accuracy**
    - **Validates: Requirements 10.3**

  - [ ]* 18.4 Write property test for project count accuracy
    - **Property 28: Project count accuracy**
    - **Validates: Requirements 10.4**

  - [ ]* 18.5 Write property test for learning time accuracy
    - **Property 29: Learning time accuracy**
    - **Validates: Requirements 10.5**

  - [ ]* 18.6 Write property test for streak calculation accuracy
    - **Property 30: Streak calculation accuracy**
    - **Validates: Requirements 10.6**

  - [x] 18.7 Create StatsCard component
    - Display stat title and icon
    - Show large value with formatting
    - Add optional trend indicator (up/down arrow)
    - Support different color themes
    - _Requirements: 10.1_

  - [x] 18.8 Create StreakCalendar component
    - Build GitHub-style contribution graph
    - Show last 90 days of activity
    - Color code by activity level
    - Add hover tooltips with daily details
    - _Requirements: 10.6_

  - [x] 18.9 Create progress API endpoint
    - Create GET /api/progress endpoint
    - Calculate all dashboard metrics from database
    - Calculate current streak from daily_activity
    - Return formatted progress data
    - _Requirements: 10.1, 10.6_

  - [ ]* 18.10 Write unit tests for dashboard components
    - Test metric calculations
    - Test streak calculation logic
    - Test calendar rendering
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 19. Implement adaptive difficulty system
  - [x] 19.1 Create performance metrics tracking
    - Track completion_time for each lesson
    - Track error_count during lessons
    - Track attempts per lesson
    - Calculate average performance metrics
    - _Requirements: 11.1_

  - [ ]* 19.2 Write property test for performance metrics tracking
    - **Property 31: Performance metrics tracking**
    - **Validates: Requirements 11.1**

  - [x] 19.3 Implement difficulty adjustment algorithm
    - Create calculateDifficultyAdjustment() function
    - Analyze last 5 lessons performance
    - Increase difficulty if: avg completion time < 10 min AND error count < 2
    - Decrease difficulty if: avg completion time > 20 min OR error count > 5
    - Maintain difficulty otherwise
    - Clamp difficulty level between 1-5
    - _Requirements: 11.2, 11.3_

  - [x] 19.4 Create difficulty adjustment API
    - Create POST /api/difficulty/adjust endpoint
    - Calculate new difficulty level
    - Update user_progress.difficulty_level
    - Create user_event record for adjustment
    - Generate notification for user
    - _Requirements: 11.4, 11.5, 11.6_

  - [ ]* 19.5 Write property test for difficulty adjustment persistence
    - **Property 32: Difficulty adjustment persistence**
    - **Validates: Requirements 11.6**

  - [ ]* 19.6 Write property test for difficulty-based content selection
    - **Property 33: Difficulty-based content selection**
    - **Validates: Requirements 11.4**

  - [ ]* 19.7 Write property test for difficulty adjustment notification
    - **Property 34: Difficulty adjustment notification**
    - **Validates: Requirements 11.5**

  - [x] 19.8 Integrate difficulty adjustment into lesson completion
    - Call difficulty adjustment after every 5th lesson
    - Display notification to user if level changes
    - Update upcoming lessons based on new level
    - _Requirements: 11.4, 11.5_

  - [ ]* 19.9 Write unit tests for difficulty algorithm
    - Test increase conditions
    - Test decrease conditions
    - Test boundary conditions (level 1 and 5)
    - _Requirements: 11.2, 11.3_

- [x] 20. Checkpoint - Adaptive features working
  - Ensure all tests pass, ask the user if questions arise.


- [x] 21. Implement re-engagement system
  - [x] 21.1 Create inactivity detection system
    - Create scheduled job to check daily_activity
    - Identify users inactive for 3+ days
    - Filter out users who opted out of emails
    - Query user_progress for personalization data
    - _Requirements: 12.1, 12.5_

  - [x] 21.2 Create re-engagement email templates
    - Design email template with user's goal
    - Include current progress stats
    - Add direct link to next lesson
    - Add motivational message
    - Include unsubscribe link
    - _Requirements: 12.2, 12.3_

  - [ ]* 21.3 Write property test for reminder personalization
    - **Property 35: Reminder personalization**
    - **Validates: Requirements 12.2**

  - [ ]* 21.4 Write property test for reminder link inclusion
    - **Property 36: Reminder link inclusion**
    - **Validates: Requirements 12.3**

  - [x] 21.5 Implement email sending logic
    - Create sendReengagementEmails() function
    - Check last email sent timestamp
    - Enforce 3-day minimum between emails
    - Send via Resend API
    - Track sent emails in database
    - _Requirements: 12.4, 12.6_

  - [ ]* 21.6 Write property test for reminder frequency limit
    - **Property 37: Reminder frequency limit**
    - **Validates: Requirements 12.4**

  - [ ]* 21.7 Write property test for opt-out respect
    - **Property 38: Opt-out respect**
    - **Validates: Requirements 12.5**

  - [ ]* 21.8 Write property test for email tracking persistence
    - **Property 39: Email tracking persistence**
    - **Validates: Requirements 12.6**

  - [x] 21.9 Create email preferences UI
    - Add email preferences section to user settings
    - Add toggle for re-engagement emails
    - Save preferences to user_profiles
    - Show last email sent date
    - _Requirements: 12.5_

  - [ ]* 21.10 Write unit tests for re-engagement system
    - Test inactivity detection
    - Test frequency enforcement
    - Test opt-out filtering
    - _Requirements: 12.1, 12.4, 12.5_

- [x] 22. Implement goal pivot functionality
  - [x] 22.1 Create goal pivot UI
    - Add "Change Goal" button to dashboard
    - Create goal pivot modal/page
    - Show current goal and progress
    - Add new goal input (same as onboarding)
    - Show warning about progress preservation
    - Add confirmation step
    - _Requirements: 13.1, 13.2_

  - [x] 22.2 Implement goal pivot API
    - Create POST /api/roadmap/pivot endpoint
    - Validate new goal input
    - Archive current roadmap (status: 'archived')
    - Generate new roadmap via Claude API
    - Save new roadmap with status 'active'
    - Update user_progress.current_roadmap_id
    - Preserve all historical lesson_progress records
    - _Requirements: 13.3, 13.4, 13.5, 13.6_

  - [ ]* 22.3 Write property test for goal pivot roadmap generation
    - **Property 40: Goal pivot roadmap generation**
    - **Validates: Requirements 13.4**

  - [ ]* 22.4 Write property test for historical data preservation
    - **Property 41: Historical data preservation**
    - **Validates: Requirements 13.5**

  - [ ]* 22.5 Write property test for previous roadmap archival
    - **Property 42: Previous roadmap archival**
    - **Validates: Requirements 13.6**

  - [x] 22.6 Create progress history view
    - Show archived roadmaps
    - Display completion stats for each roadmap
    - Allow viewing past lessons and projects
    - Show timeline of goal changes
    - _Requirements: 13.5_

  - [ ]* 22.7 Write unit tests for goal pivot
    - Test roadmap archival
    - Test new roadmap generation
    - Test progress preservation
    - _Requirements: 13.4, 13.5, 13.6_


- [x] 23. Implement analytics tracking
  - [x] 23.1 Set up PostHog integration
    - Initialize PostHog client
    - Configure user identification
    - Set up event tracking utilities
    - Add privacy-compliant tracking
    - _Requirements: 17.8_

  - [x] 23.2 Implement key event tracking
    - Track user registration
    - Track onboarding completion
    - Track lesson starts and completions
    - Track code executions
    - Track chat messages
    - Track project submissions
    - Track goal pivots
    - _Requirements: 17.7_

  - [ ]* 23.3 Write property test for analytics event timestamping
    - **Property 62: Analytics event timestamping**
    - **Validates: Requirements 17.7**

  - [x] 23.4 Create analytics dashboard queries
    - Create GET /api/analytics/onboarding-rate endpoint
    - Create GET /api/analytics/retention endpoint
    - Create GET /api/analytics/projects-per-user endpoint
    - Create GET /api/analytics/session-duration endpoint
    - Create GET /api/analytics/lesson-completion-rate endpoint
    - Create GET /api/analytics/chat-usage endpoint
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [ ]* 23.5 Write property test for onboarding completion rate
    - **Property 56: Onboarding completion rate calculation**
    - **Validates: Requirements 17.1**

  - [ ]* 23.6 Write property test for Day-7 retention
    - **Property 57: Day-7 retention calculation**
    - **Validates: Requirements 17.2**

  - [ ]* 23.7 Write property test for projects per user
    - **Property 58: Projects per user calculation**
    - **Validates: Requirements 17.3**

  - [ ]* 23.8 Write property test for average session duration
    - **Property 59: Average session duration calculation**
    - **Validates: Requirements 17.4**

  - [ ]* 23.9 Write property test for lesson completion rate
    - **Property 60: Lesson completion rate calculation**
    - **Validates: Requirements 17.5**

  - [ ]* 23.10 Write property test for chat usage frequency
    - **Property 61: Chat usage frequency tracking**
    - **Validates: Requirements 17.6**

  - [x] 23.11 Create NPS survey system
    - Create NPS survey modal (0-10 scale)
    - Trigger survey after 5 completed lessons
        - Save responses to database
    - Create GET /api/analytics/nps endpoint
    - _Requirements: 17.9_

  - [ ]* 23.12 Write property test for NPS calculation
    - **Property 63: NPS calculation**
    - **Validates: Requirements 17.9**

  - [ ]* 23.13 Write unit tests for analytics calculations
    - Test retention calculation
    - Test completion rate calculation
    - Test NPS calculation
    - _Requirements: 17.1, 17.2, 17.5, 17.9_

- [x] 24. Checkpoint - Retention features complete
  - Ensure all tests pass, ask the user if questions arise.


### Phase 4: Testing & Quality Assurance (Throughout)

- [x] 25. Implement comprehensive error handling
  - [x] 25.1 Create error boundary components
    - Implement ErrorBoundary class component
    - Add Sentry error logging in componentDidCatch
    - Create fallback UI with reload button
    - Wrap app sections with error boundaries
    - _Requirements: 15.5_

  - [ ]* 25.2 Write property test for error boundary protection
    - **Property 45: Error boundary protection**
    - **Validates: Requirements 15.5**

  - [x] 25.3 Implement API error handling
    - Create fetchWithRetry utility with exponential backoff
    - Add network error detection and retry
    - Implement graceful degradation for API failures
    - Display user-friendly error messages
    - Add manual retry buttons
    - _Requirements: 15.1, 15.3, 19.4_

  - [ ]* 25.4 Write property test for API failure graceful degradation
    - **Property 44: API failure graceful degradation**
    - **Validates: Requirements 15.3**

  - [ ]* 25.5 Write property test for AI request retry availability
    - **Property 49: AI request retry availability**
    - **Validates: Requirements 19.4**

  - [x] 25.6 Implement form validation and error display
    - Add Zod schemas for all forms
    - Implement inline validation
    - Highlight invalid fields with red borders
    - Display specific error messages per field
    - Disable submit until valid
    - _Requirements: 19.2_

  - [ ]* 25.7 Write property test for form validation feedback
    - **Property 47: Form validation feedback**
    - **Validates: Requirements 19.2**

  - [x] 25.8 Implement error logging system
    - Create logError utility function
    - Send errors to Sentry with context
    - Include user ID, feature, severity tags
    - Add breadcrumbs for debugging
    - _Requirements: 15.6_

  - [ ]* 25.9 Write property test for error logging
    - **Property 46: Error logging**
    - **Validates: Requirements 15.6**

  - [x] 25.10 Create user-facing error messages
    - Implement error message mapping
    - Add actionable guidance to errors
    - Display success messages for completed actions
    - Add loading states for async operations
    - _Requirements: 19.1, 19.5, 19.7_

  - [ ]* 25.11 Write property test for code execution error display
    - **Property 48: Code execution error display**
    - **Validates: Requirements 19.3**

  - [ ]* 25.12 Write property test for success message display
    - **Property 50: Success message display**
    - **Validates: Requirements 19.5**

  - [ ]* 25.13 Write property test for actionable error guidance
    - **Property 51: Actionable error guidance**
    - **Validates: Requirements 19.7**

  - [ ]* 25.14 Write unit tests for error handling
    - Test retry logic
    - Test error message formatting
    - Test error boundary fallback
    - _Requirements: 15.1, 15.3, 15.5_


- [x] 26. Implement security hardening
  - [x] 26.1 Implement password security
    - Use bcrypt with 10+ salt rounds
    - Add password strength validation
    - Implement password reset flow
    - Add rate limiting to auth endpoints
    - _Requirements: 16.2_

  - [ ]* 26.2 Write property test for password encryption
    - **Property 52: Password encryption**
    - **Validates: Requirements 16.2**

  - [x] 26.3 Verify Row Level Security policies
    - Test RLS policies for all tables
    - Verify users cannot access other users' data
    - Test policy enforcement on all operations
    - _Requirements: 16.5_

  - [ ]* 26.4 Write property test for data access isolation
    - **Property 53: Data access isolation**
    - **Validates: Requirements 16.5**

  - [x] 26.5 Implement input sanitization
    - Sanitize code execution inputs
    - Validate all API inputs with Zod
    - Add XSS protection for user content
    - Implement CSRF protection
    - _Requirements: 16.3, 16.4_

  - [x] 26.6 Implement rate limiting
    - Add rate limiting to AI endpoints (10 req/10s)
    - Add rate limiting to code execution (5 req/min)
    - Add rate limiting to auth endpoints (5 req/min)
    - Use Upstash Redis for rate limit storage
    - _Requirements: 16.6_

  - [x] 26.7 Implement data export functionality
    - Create GET /api/user/export endpoint
    - Gather all user data (profile, roadmaps, progress, conversations, code)
    - Return as downloadable JSON
    - Add authentication check
    - _Requirements: 16.8_

  - [ ]* 26.8 Write property test for data export completeness
    - **Property 54: Data export completeness**
    - **Validates: Requirements 16.8**

  - [x] 26.9 Implement account deletion
    - Create DELETE /api/user/account endpoint
    - Delete all user data via CASCADE
    - Delete auth user from Supabase
    - Add confirmation step in UI
    - _Requirements: 16.9_

  - [ ]* 26.10 Write property test for account deletion completeness
    - **Property 55: Account deletion completeness**
    - **Validates: Requirements 16.9**

  - [ ]* 26.11 Write unit tests for security features
    - Test password hashing
    - Test rate limiting
    - Test input sanitization
    - _Requirements: 16.2, 16.3, 16.6_

- [x] 27. Implement responsive design
  - [x] 27.1 Create responsive layouts
    - Implement mobile-first CSS with Tailwind
    - Add breakpoints for tablet and desktop
    - Make navigation responsive (hamburger menu on mobile)
    - Ensure touch targets are 44x44px minimum
    - _Requirements: 14.1, 14.2_

  - [x] 27.2 Optimize code editor for mobile
    - Add mobile-friendly editor controls
    - Implement swipe gestures for switching views
    - Add fullscreen mode for mobile editor
    - Optimize keyboard handling on mobile
    - _Requirements: 14.1_

  - [x] 27.3 Implement responsive typography
    - Set base font size 16px
    - Use relative units (rem, em)
    - Ensure font sizes between 14px-18px
    - Add responsive line heights
    - _Requirements: 14.5_

  - [ ]* 27.4 Write property test for font size constraints
    - **Property 43: Font size constraints**
    - **Validates: Requirements 14.5**

  - [x] 27.4 Test responsive layouts
    - Test on mobile (375px, 414px)
    - Test on tablet (768px, 1024px)
    - Test on desktop (1280px, 1920px)
    - Verify no horizontal scroll
    - _Requirements: 14.1, 14.2_

  - [ ]* 27.6 Write unit tests for responsive components
    - Test breakpoint behavior
    - Test mobile navigation
    - Test touch interactions
    - _Requirements: 14.1, 14.2_


- [x] 28. Implement accessibility features
  - [x] 28.1 Add keyboard navigation support
    - Ensure all interactive elements are keyboard accessible
    - Implement logical tab order
    - Add keyboard shortcuts documentation
    - Test navigation with Tab, Enter, Space, Escape
    - _Requirements: 20.1_

  - [ ]* 28.2 Write property test for keyboard navigation completeness
    - **Property 70: Keyboard navigation completeness**
    - **Validates: Requirements 20.1**

  - [x] 28.3 Add ARIA labels and roles
    - Add aria-label to icon buttons
    - Add aria-labelledby to form sections
    - Add role attributes to custom components
    - Add aria-live regions for dynamic content
    - _Requirements: 20.2, 20.4_

  - [ ]* 28.4 Write property test for ARIA label presence
    - **Property 71: ARIA label presence**
    - **Validates: Requirements 20.2**

  - [x] 28.5 Ensure color contrast compliance
    - Audit all text/background combinations
    - Ensure 4.5:1 contrast ratio minimum
    - Fix low-contrast elements
    - Test with contrast checker tools
    - _Requirements: 20.3_

  - [ ]* 28.6 Write property test for color contrast compliance
    - **Property 72: Color contrast compliance**
    - **Validates: Requirements 20.3**

  - [x] 28.7 Add alt text to images
    - Add descriptive alt text to all images
    - Add alt text to icons
    - Use empty alt for decorative images
    - _Requirements: 20.5_

  - [ ]* 28.8 Write property test for alt text presence
    - **Property 73: Alt text presence**
    - **Validates: Requirements 20.5**

  - [x] 28.9 Implement focus indicators
    - Add visible focus styles to all interactive elements
    - Use outline or border for focus indication
    - Ensure focus indicators have sufficient contrast
    - Test focus visibility across all components
    - _Requirements: 20.7_

  - [ ]* 28.10 Write property test for focus indicator visibility
    - **Property 74: Focus indicator visibility**
    - **Validates: Requirements 20.7**

  - [x] 28.11 Add screen reader support
    - Test with NVDA/JAWS (Windows) or VoiceOver (Mac)
    - Add skip navigation links
    - Ensure proper heading hierarchy
    - Add descriptive link text
    - _Requirements: 20.6_

  - [ ]* 28.12 Write unit tests for accessibility
    - Test keyboard navigation flows
    - Test ARIA attribute presence
    - Test focus management
    - _Requirements: 20.1, 20.2, 20.7_

- [-] 29. Implement content management features
  - [x] 29.1 Create lesson content validation
    - Validate JSONB structure on insert/update
    - Ensure required fields (sections, learningObjectives, exercises)
    - Validate array types and nested structures
    - _Requirements: 18.1_

  - [ ]* 29.2 Write property test for lesson content structure validation
    - **Property 64: Lesson content structure validation**
    - **Validates: Requirements 18.1**

  - [x] 29.3 Implement markdown rendering
    - Integrate markdown parser (remark/rehype)
    - Support headings, lists, emphasis, links
    - Add syntax highlighting for code blocks
    - Sanitize HTML output
    - _Requirements: 18.2, 18.3_

  - [ ]* 29.4 Write property test for markdown rendering
    - **Property 65: Markdown rendering**
    - **Validates: Requirements 18.2**

  - [ ]* 29.5 Write property test for code example rendering
    - **Property 66: Code example rendering**
    - **Validates: Requirements 18.3**

  - [x] 29.6 Implement test case execution
    - Create runTestCases() function
    - Execute user code against test cases
    - Compare outputs with expected results
    - Return pass/fail for each test
    - Display results to user
    - _Requirements: 18.5_

  - [ ]* 29.7 Write property test for test case execution
    - **Property 68: Test case execution**
    - **Validates: Requirements 18.5**

  - [x] 29.8 Implement content versioning
    - Add version column to lessons table
    - Create lesson_versions table
    - Save previous version on update
    - Add version history view
    - _Requirements: 18.6_

  - [ ]* 29.9 Write property test for content versioning
    - **Property 69: Content versioning**
    - **Validates: Requirements 18.6**

  - [ ]* 29.10 Write unit tests for content features
    - Test markdown parsing
    - Test code highlighting
    - Test test case execution
    - _Requirements: 18.2, 18.3, 18.5_

- [x] 30. Checkpoint - Quality assurance complete
  - Ensure all tests pass, ask the user if questions arise.


### Phase 5: Performance & Launch Preparation (Weeks 11-12)

- [x] 31. Implement performance optimizations
  - [x] 31.1 Add code splitting and lazy loading
    - Dynamic import Monaco Editor (ssr: false)
    - Dynamic import ChatInterface
    - Dynamic import heavy visualization components
    - Add loading skeletons for lazy components
    - _Requirements: Performance targets_

  - [x] 31.2 Implement caching strategies
    - Add SWR for client-side data caching
    - Configure Next.js route caching (revalidate)
    - Set up Redis caching for expensive queries
    - Cache roadmap data (1 hour TTL)
    - Cache lesson content (static, long TTL)
    - _Requirements: Performance targets_

  - [x] 31.3 Optimize database queries
    - Add composite indexes for common queries
    - Implement query result pagination
    - Use select() to fetch only needed fields
    - Optimize joins with proper indexing
    - Add query performance monitoring
    - _Requirements: Performance targets_

  - [x] 31.4 Optimize images and assets
    - Use Next.js Image component for all images
    - Add blur placeholders
    - Implement lazy loading for images
    - Compress and optimize static assets
    - Use WebP format where supported
    - _Requirements: Performance targets_

  - [x] 31.5 Implement API response streaming
    - Stream AI responses for real-time feedback
    - Use ReadableStream for large responses
    - Implement Server-Sent Events for updates
    - _Requirements: 4.5_

  - [ ]* 31.6 Write performance tests
    - Test page load times (< 3s target)
    - Test AI response times (< 2s first token)
    - Test code execution times (< 10s)
    - Test database query times (< 500ms)
    - _Requirements: Performance targets_

- [x] 32. Create E2E test suite
  - [x] 32.1 Set up Playwright testing
    - Install and configure Playwright
    - Set up test database and fixtures
    - Create test user accounts
    - Configure CI/CD integration
    - _Requirements: Testing strategy_

  - [x] 32.2 Write critical user journey tests
    - Test complete registration → onboarding → first lesson flow
    - Test lesson completion → next lesson unlock flow
    - Test code execution → AI help → completion flow
    - Test project submission → review → completion flow
    - Test goal pivot → new roadmap flow
    - _Requirements: Testing strategy_

  - [x] 32.3 Write integration tests
    - Test authentication flow end-to-end
    - Test roadmap generation integration
    - Test AI chat with context enrichment
    - Test code execution pipeline
    - Test progress tracking updates
    - _Requirements: Testing strategy_

  - [ ]* 32.4 Run full test suite
    - Run all unit tests (80% coverage target)
    - Run all property-based tests (74 properties)
    - Run all integration tests
    - Run all E2E tests
    - Fix any failing tests
    - _Requirements: Testing strategy_


- [ ] 33. Prepare for production deployment
  - [ ] 33.1 Configure production environment
    - Set up production Supabase project
    - Configure production environment variables
    - Set up production Claude API key
    - Configure production Resend account
    - Set up production PostHog project
    - Configure production Sentry project
    - _Requirements: Deployment_

  - [ ] 33.2 Set up CI/CD pipeline
    - Create GitHub Actions workflow
    - Add automated testing on PR
    - Add automated deployment to Vercel
    - Configure preview deployments
    - Add deployment notifications
    - _Requirements: Deployment_

  - [ ] 33.3 Implement monitoring and alerting
    - Set up Sentry error alerts
    - Configure performance monitoring
    - Add uptime monitoring
    - Set up database performance monitoring
    - Create alert rules for critical errors
    - _Requirements: 15.6_

  - [ ] 33.4 Create database backup strategy
    - Configure Supabase automated backups
    - Set up point-in-time recovery
    - Document backup restoration process
    - Test backup restoration
    - _Requirements: Data safety_

  - [ ] 33.5 Perform security audit
    - Review all authentication flows
    - Test RLS policies thoroughly
    - Audit API endpoints for vulnerabilities
    - Test rate limiting effectiveness
    - Review environment variable security
    - Test input sanitization
    - _Requirements: 16.1-16.9_

  - [ ] 33.6 Optimize production build
    - Run production build and analyze bundle size
    - Remove unused dependencies
    - Optimize bundle splitting
    - Minimize JavaScript payload
    - Test production build locally
    - _Requirements: Performance targets_

  - [ ] 33.7 Create deployment documentation
    - Document deployment process
    - Document environment setup
    - Document rollback procedures
    - Document monitoring and alerting
    - Create runbook for common issues
    - _Requirements: Operations_

- [ ] 34. Final testing and polish
  - [ ] 34.1 Conduct user acceptance testing
    - Test all user flows manually
    - Verify all features work as expected
    - Test on multiple devices and browsers
    - Test with different user personas
    - Document any issues found
    - _Requirements: All requirements_

  - [ ] 34.2 Fix critical bugs
    - Prioritize bugs by severity
    - Fix all critical and high-priority bugs
    - Retest fixed issues
    - Update tests to prevent regressions
    - _Requirements: Quality_

  - [ ] 34.3 Polish UI and UX
    - Review all animations and transitions
    - Ensure consistent spacing and typography
    - Verify color scheme consistency
    - Test loading states and error messages
    - Improve micro-interactions
    - _Requirements: 14.1-14.5_

  - [ ] 34.4 Optimize for success metrics
    - Review onboarding flow for friction points
    - Optimize lesson completion flow
    - Improve AI response quality
    - Enhance progress visibility
    - Add motivational elements
    - _Requirements: Success metrics_

  - [ ] 34.5 Prepare launch materials
    - Create user onboarding guide
    - Prepare FAQ documentation
    - Create demo video/screenshots
    - Set up support channels
    - Prepare launch announcement
    - _Requirements: Launch_

- [ ] 35. Final checkpoint - Production ready
  - Ensure all tests pass, ask the user if questions arise.


## Notes

### Task Organization
- Tasks are organized into 5 phases aligned with the 12-week timeline
- Each phase builds incrementally on previous work
- Checkpoints ensure quality and allow for user feedback

### Optional Tasks
- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Optional tasks are primarily property-based tests and unit tests
- Core implementation tasks are never marked optional
- Skipping optional tasks will reduce test coverage but won't block functionality

### Requirements Traceability
- Each task references specific requirements from requirements.md
- Property-based test tasks reference design properties by number
- This ensures complete coverage of all acceptance criteria

### Testing Strategy
- Property-based tests validate universal correctness properties (74 total)
- Unit tests validate specific examples and edge cases
- Integration tests validate component interactions
- E2E tests validate complete user journeys
- All property tests must run 100+ iterations due to randomization

### Implementation Approach
- Follow incremental development: each task builds on previous work
- No orphaned code: all code is integrated immediately
- Early validation: test core functionality as soon as possible
- Context-aware: all implementation has access to requirements and design docs

### Success Metrics Targets
- Day-7 retention ≥ 40%
- Onboarding completion ≥ 60%
- Projects built per active user ≥ 3/month
- NPS ≥ 50

### Performance Targets
- Page load (SSR): < 3 seconds
- AI chat response (first token): < 2 seconds
- AI chat response (complete): < 5 seconds
- Code execution: < 10 seconds
- Database queries: < 500ms
- API endpoints: < 1 second

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI**: Claude API (claude-sonnet-4-20250514)
- **Code Execution**: Piston API
- **Email**: Resend
- **Analytics**: PostHog
- **Monitoring**: Sentry
- **Testing**: Vitest, fast-check, Playwright
- **Deployment**: Vercel

### Getting Started
To begin implementation:
1. Open this tasks.md file
2. Click "Start task" next to any task item
3. Follow the task description and requirements references
4. Mark tasks complete as you finish them
5. Use checkpoints to validate progress

### Next Steps After Task Creation
This workflow creates planning artifacts only. To implement the feature:
1. Review the complete task list
2. Start with Phase 1, Task 1
3. Work through tasks sequentially
4. Use checkpoints to gather feedback
5. Adjust priorities based on learnings
