/**
 * AI-related type definitions
 */

export interface UserProfile {
     id: string;
     name: string;
     email: string;
     learningGoal: string | null;
     timeCommitment: number | null;
     experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null;
     onboardingCompleted: boolean;
     createdAt: string;
     updatedAt: string;
}

export interface Lesson {
     id: string;
     roadmapId: string;
     title: string;
     description: string;
     content: LessonContent;
     orderIndex: number;
     estimatedDuration: number;
     difficultyLevel: number;
     prerequisites: string[];
     language: 'javascript' | 'python' | 'html';
     starterCode: string | null;
     testCases: TestCase[] | null;
     createdAt: string;
     updatedAt: string;
}

export interface LessonContent {
     sections: LessonSection[];
     learningObjectives: string[];
     exercises: Exercise[];
}

export interface LessonSection {
     type: 'text' | 'code' | 'image' | 'video';
     content: string;
     language?: string;
}

export interface Exercise {
     id: string;
     prompt: string;
     starterCode?: string;
     solution?: string;
     hints: string[];
}

export interface TestCase {
     input: unknown;
     expectedOutput: unknown;
     description: string;
}

export interface LessonProgress {
     id: string;
     userId: string;
     lessonId: string;
     status: 'not_started' | 'in_progress' | 'completed';
     startedAt: string | null;
     completedAt: string | null;
     completionTime: number | null;
     attempts: number;
     errorCount: number;
     createdAt: string;
     updatedAt: string;
}

export interface Message {
     id: string;
     conversationId: string;
     role: 'user' | 'assistant';
     content: string;
     contextSnapshot: AIContext | null;
     createdAt: string;
}

export interface CodeSave {
     id: string;
     userId: string;
     lessonId: string | null;
     projectId: string | null;
     code: string;
     language: string;
     savedAt: string;
}

export interface AIContext {
     userProfile: UserProfile;
     currentLesson?: Lesson;
     recentProgress: LessonProgress[];
     conversationHistory: Message[];
     recentCodeSubmissions: CodeSave[];
     difficultyLevel: number;
}

export interface CodeReview {
     overallFeedback: string;
     issues: CodeIssue[];
     suggestions: string[];
     score: number;
     strengths: string[];
}

export interface CodeIssue {
     line: number | null;
     severity: 'error' | 'warning' | 'info';
     message: string;
     suggestion: string;
}
