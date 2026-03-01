/**
 * Prompt Template Service
 * Manages AI prompt templates and context enrichment for various AI operations
 */

import { AIContext, UserProfile, Lesson } from '@/lib/types';

export interface RoadmapGenerationContext {
     goal: string;
     timeCommitment: number;
     experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface RoadmapGenerationResponse {
     roadmap: {
          title: string;
          description: string;
          estimatedWeeks: number;
     };
     lessons: Array<{
          title: string;
          description: string;
          orderIndex: number;
          estimatedDuration: number;
          difficultyLevel: number;
          prerequisites: string[];
          language: 'javascript' | 'python' | 'html';
          content: {
               sections: Array<{
                    type: 'text' | 'code';
                    content: string;
                    language?: string;
               }>;
               learningObjectives: string[];
               exercises: Array<{
                    id: string;
                    prompt: string;
                    starterCode?: string;
                    hints: string[];
               }>;
          };
          starterCode: string | null;
     }>;
     projects: Array<{
          title: string;
          description: string;
          orderIndex: number;
          requirements: Array<{
               id: string;
               description: string;
               priority: 'must' | 'should' | 'could';
          }>;
          successCriteria: Array<{
               id: string;
               description: string;
               testable: boolean;
          }>;
          unlockAfterLesson: number;
     }>;
}

export class PromptTemplateService {
     /**
      * Build roadmap generation prompt with user context
      */
     buildRoadmapGenerationPrompt(context: RoadmapGenerationContext): string {
          const systemPrompt = `Generate a personalized coding roadmap for a learner with the following profile:

Goal: ${context.goal}
Time commitment: ${context.timeCommitment} hours per week
Experience level: ${context.experienceLevel}

Requirements:
1. Create a roadmap with 15-25 lessons that directly support achieving their goal
2. Each lesson must be completable in 15 minutes or less
3. Include 3-5 project milestones that build toward their goal
4. Order lessons by prerequisite dependencies (use orderIndex for the lesson that must be completed before)
5. Start with fundamentals only if necessary for their goal
6. Focus on practical, hands-on learning
7. Choose the most appropriate language (javascript, python, or html) for each lesson based on the goal
8. For prerequisites, use the orderIndex of prerequisite lessons (empty array if no prerequisites)
9. Each lesson should have 2-4 learning objectives
10. Each lesson should have 1-2 exercises with starter code and hints

Output format (JSON):
{
  "roadmap": {
    "title": "string (e.g., 'Build a Todo App with React')",
    "description": "string (2-3 sentences about what they'll learn)",
    "estimatedWeeks": number (based on time commitment)
  },
  "lessons": [
    {
      "title": "string (clear, specific lesson title)",
      "description": "string (what they'll learn in this lesson)",
      "orderIndex": number (0-based, sequential ordering),
      "estimatedDuration": number (minutes, max 15),
      "difficultyLevel": number (1-5, adjust based on experience level),
      "prerequisites": [number] (array of orderIndex values of prerequisite lessons),
      "language": "javascript" | "python" | "html",
      "content": {
        "sections": [
          {
            "type": "text" | "code",
            "content": "string (explanation or code example)",
            "language": "javascript" | "python" | "html" (only for code sections)
          }
        ],
        "learningObjectives": ["string"],
        "exercises": [
          {
            "id": "string (e.g., 'exercise-1')",
            "prompt": "string (clear instructions)",
            "starterCode": "string (optional starter code)",
            "hints": ["string"]
          }
        ]
      },
      "starterCode": "string | null (code template for the lesson)"
    }
  ],
  "projects": [
    {
      "title": "string (project name)",
      "description": "string (what they'll build)",
      "orderIndex": number (0-based, when in roadmap),
      "requirements": [
        {
          "id": "string (e.g., 'req-1')",
          "description": "string",
          "priority": "must" | "should" | "could"
        }
      ],
      "successCriteria": [
        {
          "id": "string (e.g., 'criteria-1')",
          "description": "string",
          "testable": boolean
        }
      ],
      "unlockAfterLesson": number (orderIndex of lesson that unlocks this project)
    }
  ]
}

Important:
- Make the roadmap highly specific to their goal
- If they want to build something specific (e.g., "a todo app"), structure lessons to build exactly that
- Use their experience level to set appropriate difficulty (beginner: 1-2, intermediate: 2-4, advanced: 3-5)
- Ensure prerequisites are logical (can't reference a lesson that comes later)
- Projects should be unlocked after relevant lessons are completed
- Each lesson should be self-contained but build on previous knowledge
- Include practical, hands-on exercises in every lesson
- Provide helpful starter code and hints for exercises

Return ONLY valid JSON, no additional text or explanation.`;

          return systemPrompt;
     }

     /**
      * Build code review prompt with context
      */
     buildCodeReviewPrompt(
          code: string,
          language: string,
          context: {
               experienceLevel: string;
               lessonTitle?: string;
               learningObjective?: string;
          }
     ): string {
          return `Review the following code submission for a coding learner:

Learner context:
- Experience level: ${context.experienceLevel}
${context.lessonTitle ? `- Current lesson: ${context.lessonTitle}` : ''}
${context.learningObjective ? `- Learning objective: ${context.learningObjective}` : ''}

Code:
\`\`\`${language}
${code}
\`\`\`

Evaluation criteria:
1. Correctness: Does it solve the problem?
2. Code quality: Is it readable and well-structured?
3. Best practices: Does it follow language conventions?
4. Learning alignment: Does it demonstrate understanding of the lesson concepts?

Provide feedback in this JSON format:
{
  "overallFeedback": "string (2-3 sentences)",
  "score": number (0-100),
  "strengths": ["string"],
  "issues": [
    {
      "line": number | null,
      "severity": "error" | "warning" | "info",
      "message": "string",
      "suggestion": "string"
    }
  ],
  "suggestions": ["string"],
  "nextSteps": "string"
}

Tone: Encouraging and constructive. Celebrate what they did well before addressing issues.
Return ONLY valid JSON, no additional text or explanation.`;
     }

     /**
      * Enrich context for roadmap generation
      */
     enrichRoadmapContext(
          goal: string,
          timeCommitment: number,
          experienceLevel: 'beginner' | 'intermediate' | 'advanced'
     ): RoadmapGenerationContext {
          return {
               goal: goal.trim(),
               timeCommitment,
               experienceLevel,
          };
     }

     /**
      * Build chat prompt with context injection
      */
     buildChatPrompt(userMessage: string, context: AIContext): string {
          let prompt = userMessage;

          // Add current lesson context if available
          if (context.currentLesson) {
               prompt = `[Current Lesson: ${context.currentLesson.title}]\n\n${prompt}`;
          }

          // Add recent code context if relevant
          if (context.recentCodeSubmissions.length > 0) {
               const latestCode = context.recentCodeSubmissions[0];
               prompt += `\n\n[Recent code in ${latestCode.language}]`;
          }

          return prompt;
     }

     /**
      * Build base AI mentor system prompt
      */
     buildMentorSystemPrompt(context: AIContext): string {
          const { userProfile, currentLesson, recentProgress, difficultyLevel } = context;

          return `You are an AI coding mentor for CodePath AI, a personalized learning platform. Your role is to:

1. Guide learners toward their specific goals (not generic programming knowledge)
2. Provide encouragement and maintain a supportive, patient tone
3. Explain concepts clearly with practical examples
4. Break down complex topics into digestible pieces
5. Ask clarifying questions when needed
6. Celebrate progress and milestones

Current learner context:
- Name: ${userProfile.name}
- Goal: ${userProfile.learningGoal || 'Not specified'}
- Experience: ${userProfile.experienceLevel || 'beginner'}
- Progress: ${recentProgress.length} lessons completed
- Difficulty Level: ${difficultyLevel}/5
${currentLesson ? `- Current lesson: ${currentLesson.title}` : ''}

Guidelines:
- Keep responses concise (2-3 paragraphs max unless explaining complex concepts)
- Use code examples when helpful
- Reference the learner's goal to maintain motivation
- Adapt difficulty based on their experience level
- If they're stuck, provide hints before solutions`;
     }

     /**
      * Build code review prompt template
      */
     buildCodeReviewSystemPrompt(context: {
          experienceLevel: string;
          lessonTitle?: string;
          learningObjective?: string;
     }): string {
          return `You are a code review assistant for CodePath AI. Review code submissions with:

Learner context:
- Experience level: ${context.experienceLevel}
${context.lessonTitle ? `- Current lesson: ${context.lessonTitle}` : ''}
${context.learningObjective ? `- Learning objective: ${context.learningObjective}` : ''}

Evaluation criteria:
1. Correctness: Does it solve the problem?
2. Code quality: Is it readable and well-structured?
3. Best practices: Does it follow language conventions?
4. Learning alignment: Does it demonstrate understanding of the lesson concepts?

Tone: Encouraging and constructive. Celebrate what they did well before addressing issues.`;
     }

     /**
      * Build debugging help prompt template
      */
     buildDebuggingHelpPrompt(
          code: string,
          language: string,
          error: string,
          context: AIContext
     ): string {
          return `Help debug this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Error:
${error}

${context.currentLesson ? `Context: Working on "${context.currentLesson.title}"` : ''}

Provide:
1. Explanation of what's causing the error
2. Step-by-step fix
3. Learning point to prevent similar errors`;
     }

     /**
      * Validate roadmap generation response
      */
     validateRoadmapResponse(response: unknown): response is RoadmapGenerationResponse {
          if (!response || typeof response !== 'object') {
               return false;
          }

          const r = response as RoadmapGenerationResponse;

          // Validate roadmap
          if (!r.roadmap || typeof r.roadmap !== 'object') {
               return false;
          }
          if (
               typeof r.roadmap.title !== 'string' ||
               typeof r.roadmap.description !== 'string' ||
               typeof r.roadmap.estimatedWeeks !== 'number'
          ) {
               return false;
          }

          // Validate lessons array
          if (!Array.isArray(r.lessons) || r.lessons.length < 15 || r.lessons.length > 25) {
               return false;
          }

          // Validate each lesson
          for (const lesson of r.lessons) {
               if (
                    typeof lesson.title !== 'string' ||
                    typeof lesson.description !== 'string' ||
                    typeof lesson.orderIndex !== 'number' ||
                    typeof lesson.estimatedDuration !== 'number' ||
                    typeof lesson.difficultyLevel !== 'number' ||
                    !Array.isArray(lesson.prerequisites) ||
                    !['javascript', 'python', 'html'].includes(lesson.language)
               ) {
                    return false;
               }

               // Validate lesson duration (max 15 minutes)
               if (lesson.estimatedDuration > 15) {
                    return false;
               }

               // Validate content structure
               if (
                    !lesson.content ||
                    !Array.isArray(lesson.content.sections) ||
                    !Array.isArray(lesson.content.learningObjectives) ||
                    !Array.isArray(lesson.content.exercises)
               ) {
                    return false;
               }
          }

          // Validate projects array
          if (!Array.isArray(r.projects) || r.projects.length < 3 || r.projects.length > 5) {
               return false;
          }

          // Validate each project
          for (const project of r.projects) {
               if (
                    typeof project.title !== 'string' ||
                    typeof project.description !== 'string' ||
                    typeof project.orderIndex !== 'number' ||
                    !Array.isArray(project.requirements) ||
                    !Array.isArray(project.successCriteria) ||
                    typeof project.unlockAfterLesson !== 'number'
               ) {
                    return false;
               }
          }

          return true;
     }
}

// Export singleton instance
export const promptTemplateService = new PromptTemplateService();
