# Requirements Document

## Introduction

CodePath AI is a free, AI-powered coding education platform that acts as a personal AI mentor. The system learns user goals, builds dynamic coding roadmaps tailored to individual needs, and guides users through learning in focused 15-minute sessions. The platform differentiates itself through goal-first onboarding (not language-first), true AI personalization with context-aware mentoring, micro-sessions, build-as-you-learn projects, and a free core tier.

The MVP targets three user segments: The Busy Beginner (career transitioners with limited time), App Builders (non-technical founders), and Curious Students. The 12-week MVP build focuses on establishing the core learning loop, depth and retention features, with growth features planned post-launch.

## Glossary

- **Platform**: The CodePath AI web application system
- **User**: A person using the CodePath AI platform to learn coding
- **AI_Mentor**: The Claude API-powered conversational assistant that guides users
- **Roadmap**: A personalized, dynamic learning path generated for a specific user
- **Micro_Session**: A focused learning session lasting 15 minutes or less
- **Learning_Goal**: A user-defined objective for what they want to build or achieve
- **Lesson**: A single learning unit within a roadmap
- **Project**: A practical coding exercise that users build during learning
- **Code_Editor**: The Monaco Editor component for writing code
- **Code_Executor**: The Piston API service for running code in a sandboxed environment
- **Onboarding_Flow**: The initial user experience that captures goals and generates roadmaps
- **Progress_Dashboard**: The interface displaying user learning progress and achievements
- **Difficulty_Level**: A measure of lesson complexity (beginner, intermediate, advanced)
- **Context_Memory**: The system's stored knowledge about a user's learning history
- **Re_Engagement_System**: Automated notifications to bring users back to learning
- **Code_Review**: AI-generated feedback on user-written code
- **Goal_Pivot**: The ability for users to change their learning objectives

## Requirements

### Requirement 1: User Authentication and Profile Management

**User Story:** As a new user, I want to create an account and manage my profile, so that I can access personalized learning experiences.

#### Acceptance Criteria

1. THE Platform SHALL provide user registration with email and password
2. THE Platform SHALL provide user authentication using Supabase Auth
3. WHEN a user registers, THE Platform SHALL create a user profile in the database
4. THE Platform SHALL store user profile data including name, email, and registration timestamp
5. WHEN a user logs in successfully, THE Platform SHALL redirect them to the appropriate page based on onboarding status
6. THE Platform SHALL provide password reset functionality via email

### Requirement 2: Goal-First Onboarding Flow

**User Story:** As a new user, I want to describe what I want to build or achieve, so that the platform can create a personalized learning path for me.

#### Acceptance Criteria

1. WHEN a new user completes registration, THE Platform SHALL present the onboarding flow
2. THE Onboarding_Flow SHALL ask users to describe their learning goal in natural language
3. THE Onboarding_Flow SHALL ask users about their available time commitment per week
4. THE Onboarding_Flow SHALL ask users about their current coding experience level
5. THE Onboarding_Flow SHALL collect user responses without requiring specific programming language selection
6. WHEN onboarding is incomplete, THE Platform SHALL redirect authenticated users to the onboarding flow
7. THE Platform SHALL store all onboarding responses in the user profile

### Requirement 3: AI-Powered Roadmap Generation

**User Story:** As a user completing onboarding, I want the AI to generate a personalized learning roadmap, so that I have a clear path to achieve my goals.

#### Acceptance Criteria

1. WHEN a user completes the onboarding flow, THE Platform SHALL send user goals and context to the AI_Mentor
2. THE AI_Mentor SHALL generate a personalized Roadmap based on user goals, time commitment, and experience level
3. THE Roadmap SHALL include a sequence of lessons ordered by prerequisite dependencies
4. THE Roadmap SHALL include project milestones that align with the user's stated goal
5. THE Platform SHALL store the generated Roadmap in the database linked to the user
6. WHEN roadmap generation completes, THE Platform SHALL display the roadmap to the user
7. THE Roadmap SHALL estimate time requirements for each lesson within 15-minute increments

### Requirement 4: Context-Aware AI Mentor Chat

**User Story:** As a user, I want to chat with an AI mentor that remembers my progress and goals, so that I receive relevant guidance and support.

#### Acceptance Criteria

1. THE Platform SHALL provide a chat interface for interacting with the AI_Mentor
2. WHEN a user sends a message, THE Platform SHALL include Context_Memory in the AI_Mentor request
3. THE Context_Memory SHALL include the user's current lesson, completed lessons, and learning goal
4. THE Context_Memory SHALL include the user's recent code submissions and feedback
5. THE AI_Mentor SHALL generate responses using Claude API (claude-sonnet-4-20250514)
6. THE Platform SHALL store chat message history in the database
7. THE Platform SHALL display chat messages in chronological order with clear sender identification
8. WHEN the AI_Mentor responds, THE Platform SHALL display the response within 5 seconds under normal network conditions

### Requirement 5: Micro-Lesson Engine

**User Story:** As a user, I want to complete focused 15-minute learning sessions, so that I can make progress even with limited time.

#### Acceptance Criteria

1. THE Platform SHALL present lessons from the user's Roadmap one at a time
2. THE Platform SHALL display lesson content including explanations, examples, and exercises
3. THE Platform SHALL limit lesson scope to be completable within 15 minutes
4. WHEN a user starts a lesson, THE Platform SHALL record the start timestamp
5. THE Platform SHALL display a timer showing elapsed session time
6. WHEN a user completes a lesson, THE Platform SHALL mark it as complete in the database
7. WHEN a user completes a lesson, THE Platform SHALL unlock the next lesson in the Roadmap
8. THE Platform SHALL allow users to pause and resume lessons

### Requirement 6: Integrated Code Editor

**User Story:** As a user, I want to write and edit code directly in the platform, so that I can practice coding without external tools.

#### Acceptance Criteria

1. THE Platform SHALL provide a Code_Editor using Monaco Editor
2. THE Code_Editor SHALL support syntax highlighting for JavaScript, Python, and HTML/CSS
3. THE Code_Editor SHALL provide auto-completion for common language constructs
4. THE Code_Editor SHALL display line numbers
5. THE Platform SHALL save code editor content automatically every 30 seconds
6. THE Platform SHALL restore saved code when a user returns to a lesson
7. THE Code_Editor SHALL support keyboard shortcuts for common operations (save, undo, redo)

### Requirement 7: Code Execution Environment

**User Story:** As a user, I want to run my code and see the output, so that I can test my solutions and learn from results.

#### Acceptance Criteria

1. THE Platform SHALL provide a "Run Code" button in the code editor interface
2. WHEN a user clicks "Run Code", THE Platform SHALL send the code to the Code_Executor
3. THE Code_Executor SHALL execute code using Piston API in a sandboxed environment
4. THE Code_Executor SHALL support JavaScript, Python, and HTML/CSS execution
5. THE Platform SHALL display code execution output within 10 seconds
6. THE Platform SHALL display execution errors with line numbers when available
7. IF code execution exceeds 30 seconds, THEN THE Platform SHALL terminate execution and display a timeout message
8. THE Platform SHALL display console output, return values, and error messages separately

### Requirement 8: Build-as-You-Learn Projects

**User Story:** As a user, I want to build real projects while learning, so that I create tangible outcomes aligned with my goals.

#### Acceptance Criteria

1. THE Roadmap SHALL include at least 3 project milestones
2. THE Platform SHALL present project requirements and success criteria for each Project
3. THE Platform SHALL provide a dedicated workspace for each Project with persistent code storage
4. WHEN a user completes project code, THE Platform SHALL allow submission for review
5. THE Platform SHALL store all project code submissions with timestamps
6. THE Platform SHALL link completed projects to the user's profile
7. THE Platform SHALL display a list of user's projects on the Progress_Dashboard

### Requirement 9: AI Code Review

**User Story:** As a user, I want to receive AI feedback on my code, so that I can improve my coding skills and fix mistakes.

#### Acceptance Criteria

1. WHEN a user submits project code, THE Platform SHALL send the code to the AI_Mentor for review
2. THE AI_Mentor SHALL analyze code for correctness, style, and best practices
3. THE AI_Mentor SHALL generate Code_Review feedback within 15 seconds
4. THE Code_Review SHALL identify specific issues with line number references
5. THE Code_Review SHALL provide constructive suggestions for improvement
6. THE Code_Review SHALL acknowledge correct implementations
7. THE Platform SHALL display Code_Review feedback in the user interface
8. THE Platform SHALL allow users to revise and resubmit code after review

### Requirement 10: Progress Dashboard

**User Story:** As a user, I want to see my learning progress and achievements, so that I stay motivated and track my journey.

#### Acceptance Criteria

1. THE Platform SHALL provide a Progress_Dashboard accessible from the main navigation
2. THE Progress_Dashboard SHALL display the percentage of roadmap completion
3. THE Progress_Dashboard SHALL display the number of lessons completed
4. THE Progress_Dashboard SHALL display the number of projects completed
5. THE Progress_Dashboard SHALL display total learning time
6. THE Progress_Dashboard SHALL display the user's current learning streak in days
7. THE Progress_Dashboard SHALL display a visual representation of the Roadmap with completed and upcoming lessons
8. THE Progress_Dashboard SHALL display the user's Learning_Goal prominently

### Requirement 11: Adaptive Difficulty System

**User Story:** As a user, I want the platform to adjust lesson difficulty based on my performance, so that I'm appropriately challenged without being overwhelmed.

#### Acceptance Criteria

1. THE Platform SHALL track user performance metrics including completion time and error rates
2. WHEN a user completes 3 consecutive lessons quickly with no errors, THE Platform SHALL increase Difficulty_Level
3. WHEN a user struggles with 2 consecutive lessons (taking over 25 minutes or multiple failed attempts), THE Platform SHALL decrease Difficulty_Level
4. THE Platform SHALL adjust upcoming lesson content based on current Difficulty_Level
5. THE Platform SHALL notify users when difficulty adjustments occur with explanatory messages
6. THE Platform SHALL store difficulty level changes in the user's learning history

### Requirement 12: Re-Engagement System

**User Story:** As a user who hasn't logged in recently, I want to receive reminders, so that I stay consistent with my learning goals.

#### Acceptance Criteria

1. WHEN a user has not logged in for 3 days, THE Re_Engagement_System SHALL send an email reminder
2. THE Re_Engagement_System SHALL personalize reminder content based on the user's Learning_Goal and progress
3. THE Re_Engagement_System SHALL include a direct link to the user's next lesson
4. THE Re_Engagement_System SHALL send a maximum of one reminder per 3-day period
5. THE Platform SHALL provide user preferences to opt out of re-engagement emails
6. THE Re_Engagement_System SHALL track email open rates and click-through rates

### Requirement 13: Goal Pivot Capability

**User Story:** As a user, I want to change my learning goal, so that I can adapt my learning path if my interests or needs change.

#### Acceptance Criteria

1. THE Platform SHALL provide a "Change Goal" option in the Progress_Dashboard
2. WHEN a user initiates Goal_Pivot, THE Platform SHALL present a goal update interface
3. THE Platform SHALL allow users to describe their new Learning_Goal in natural language
4. WHEN a user confirms a new goal, THE AI_Mentor SHALL generate a new Roadmap
5. THE Platform SHALL preserve the user's completed lessons and projects
6. THE Platform SHALL mark the previous Roadmap as archived
7. THE Platform SHALL notify users that changing goals will create a new learning path

### Requirement 14: Responsive User Interface

**User Story:** As a user on any device, I want the platform to work well on my screen size, so that I can learn anywhere.

#### Acceptance Criteria

1. THE Platform SHALL render correctly on desktop screens (1920x1080 and above)
2. THE Platform SHALL render correctly on tablet screens (768x1024)
3. THE Platform SHALL render correctly on mobile screens (375x667 and above)
4. THE Code_Editor SHALL adapt layout for mobile devices with appropriate touch controls
5. THE Platform SHALL maintain readability with font sizes between 14px and 18px
6. THE Platform SHALL use Tailwind CSS responsive utilities for layout adaptation

### Requirement 15: Performance and Reliability

**User Story:** As a user, I want the platform to load quickly and work reliably, so that I can focus on learning without technical frustrations.

#### Acceptance Criteria

1. THE Platform SHALL load the initial page within 3 seconds on a standard broadband connection
2. THE Platform SHALL achieve a Lighthouse performance score of 80 or higher
3. THE Platform SHALL handle API failures gracefully with user-friendly error messages
4. WHEN the Claude API is unavailable, THE Platform SHALL display a maintenance message and queue requests for retry
5. THE Platform SHALL implement error boundaries to prevent full application crashes
6. THE Platform SHALL log errors to a monitoring service for debugging
7. THE Platform SHALL maintain 99% uptime during business hours

### Requirement 16: Data Persistence and Security

**User Story:** As a user, I want my data to be saved securely and reliably, so that I don't lose my progress or personal information.

#### Acceptance Criteria

1. THE Platform SHALL store all user data in Supabase PostgreSQL database
2. THE Platform SHALL encrypt user passwords using bcrypt with salt rounds of 10 or higher
3. THE Platform SHALL use HTTPS for all client-server communication
4. THE Platform SHALL implement Row Level Security (RLS) policies in Supabase
5. THE Platform SHALL ensure users can only access their own data
6. THE Platform SHALL back up the database daily
7. THE Platform SHALL comply with GDPR requirements for data privacy
8. THE Platform SHALL provide users the ability to export their data
9. THE Platform SHALL provide users the ability to delete their account and all associated data

### Requirement 17: Analytics and Metrics Tracking

**User Story:** As a product owner, I want to track key metrics, so that I can measure success and make data-driven improvements.

#### Acceptance Criteria

1. THE Platform SHALL track onboarding completion rate
2. THE Platform SHALL track Day-7 user retention rate
3. THE Platform SHALL track projects built per active user per month
4. THE Platform SHALL track average session duration
5. THE Platform SHALL track lesson completion rates
6. THE Platform SHALL track AI mentor chat usage frequency
7. THE Platform SHALL store analytics data in the database with appropriate timestamps
8. THE Platform SHALL provide an admin dashboard displaying key metrics
9. THE Platform SHALL calculate Net Promoter Score (NPS) from user surveys

### Requirement 18: Content Management for Lessons

**User Story:** As a content administrator, I want to create and update lesson content, so that the platform offers high-quality learning materials.

#### Acceptance Criteria

1. THE Platform SHALL store lesson content in a structured format in the database
2. THE Platform SHALL support markdown formatting for lesson text content
3. THE Platform SHALL support embedding code examples in lessons
4. THE Platform SHALL support attaching starter code templates to lessons
5. THE Platform SHALL support attaching test cases to validate user code
6. THE Platform SHALL version lesson content to track changes over time
7. THE Platform SHALL allow administrators to preview lessons before publishing

### Requirement 19: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN a network error occurs, THE Platform SHALL display a user-friendly error message
2. WHEN form validation fails, THE Platform SHALL highlight invalid fields with specific error messages
3. WHEN code execution fails, THE Platform SHALL display the error message and stack trace
4. WHEN the AI_Mentor request fails, THE Platform SHALL offer to retry the request
5. THE Platform SHALL display success messages for completed actions (lesson completion, code submission)
6. THE Platform SHALL use consistent error message styling throughout the application
7. THE Platform SHALL provide actionable next steps in error messages when possible

### Requirement 20: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the platform to be usable with assistive technologies, so that I can learn coding regardless of my abilities.

#### Acceptance Criteria

1. THE Platform SHALL provide keyboard navigation for all interactive elements
2. THE Platform SHALL include ARIA labels for screen reader compatibility
3. THE Platform SHALL maintain color contrast ratios of at least 4.5:1 for text
4. THE Platform SHALL support browser zoom up to 200% without breaking layout
5. THE Platform SHALL provide text alternatives for non-text content
6. THE Code_Editor SHALL be navigable via keyboard
7. THE Platform SHALL indicate focus states clearly for all interactive elements
