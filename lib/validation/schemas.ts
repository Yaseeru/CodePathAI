/**
 * Validation Schemas
 * Centralized Zod schemas for all forms
 */

import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
     email: z.string().email('Invalid email address'),
     password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
     name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
     email: z.string().email('Invalid email address'),
     password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be less than 128 characters'),
     confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
     message: "Passwords don't match",
     path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
     email: z.string().email('Invalid email address'),
});

export const newPasswordSchema = z.object({
     password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be less than 128 characters'),
     confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
     message: "Passwords don't match",
     path: ['confirmPassword'],
});

// Onboarding schemas
export const onboardingGoalSchema = z.object({
     goal: z.string().min(20, 'Please provide at least 20 characters').max(500, 'Please keep your goal under 500 characters'),
});

export const onboardingTimeCommitmentSchema = z.object({
     timeCommitment: z.number().min(1, 'Please select your time commitment').max(40, 'Time commitment must be less than 40 hours per week'),
});

export const onboardingExperienceLevelSchema = z.object({
     experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
          errorMap: () => ({ message: 'Please select your experience level' }),
     }),
});

export const onboardingSchema = z.object({
     goal: z.string().min(20, 'Please provide at least 20 characters').max(500, 'Please keep your goal under 500 characters'),
     timeCommitment: z.number().min(1, 'Please select your time commitment').max(40, 'Time commitment must be less than 40 hours per week'),
     experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
          errorMap: () => ({ message: 'Please select your experience level' }),
     }),
});

// Code execution schemas
export const codeExecutionSchema = z.object({
     code: z.string().min(1, 'Code cannot be empty').max(50000, 'Code exceeds maximum size (50KB)'),
     language: z.enum(['javascript', 'python', 'html'], {
          errorMap: () => ({ message: 'Invalid language' }),
     }),
     stdin: z.string().max(10000, 'Input exceeds maximum size (10KB)').optional(),
});

export const codeSaveSchema = z.object({
     lessonId: z.string().uuid('Invalid lesson ID'),
     code: z.string().max(50000, 'Code exceeds maximum size (50KB)'),
     language: z.enum(['javascript', 'python', 'html'], {
          errorMap: () => ({ message: 'Invalid language' }),
     }),
});

// AI chat schemas
export const chatMessageSchema = z.object({
     message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message exceeds maximum length (2000 characters)'),
     lessonId: z.string().uuid('Invalid lesson ID').optional(),
     conversationId: z.string().uuid('Invalid conversation ID').optional(),
});

// Roadmap schemas
export const roadmapGenerationSchema = z.object({
     goal: z.string().min(20, 'Goal must be at least 20 characters').max(500, 'Goal must be less than 500 characters'),
     timeCommitment: z.number().min(1, 'Time commitment must be at least 1 hour').max(40, 'Time commitment must be less than 40 hours'),
     experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
          errorMap: () => ({ message: 'Invalid experience level' }),
     }),
});

export const roadmapPivotSchema = z.object({
     newGoal: z.string().min(20, 'Goal must be at least 20 characters').max(500, 'Goal must be less than 500 characters'),
});

// Project submission schemas
export const projectSubmissionSchema = z.object({
     projectId: z.string().uuid('Invalid project ID'),
     code: z.string().min(1, 'Code cannot be empty').max(50000, 'Code exceeds maximum size (50KB)'),
     language: z.enum(['javascript', 'python', 'html'], {
          errorMap: () => ({ message: 'Invalid language' }),
     }),
});

// Settings schemas
export const emailPreferencesSchema = z.object({
     reengagementEmails: z.boolean(),
     weeklyDigest: z.boolean().optional(),
     productUpdates: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
     name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
     email: z.string().email('Invalid email address').optional(),
});

// NPS survey schema
export const npsSchema = z.object({
     score: z.number().min(0, 'Score must be between 0 and 10').max(10, 'Score must be between 0 and 10'),
     feedback: z.string().max(1000, 'Feedback must be less than 1000 characters').optional(),
});

// Lesson content validation schemas
export const lessonSectionSchema = z.object({
     type: z.enum(['text', 'code', 'image', 'video'], {
          errorMap: () => ({ message: 'Invalid section type' }),
     }),
     content: z.string().min(1, 'Section content cannot be empty'),
     language: z.string().optional(),
});

export const exerciseSchema = z.object({
     id: z.string().min(1, 'Exercise ID is required'),
     prompt: z.string().min(1, 'Exercise prompt is required'),
     starterCode: z.string().optional(),
     solution: z.string().optional(),
     hints: z.array(z.string()).default([]),
});

export const testCaseSchema = z.object({
     input: z.any(),
     expectedOutput: z.any(),
     description: z.string().min(1, 'Test case description is required'),
});

export const lessonContentSchema = z.object({
     sections: z.array(lessonSectionSchema).min(1, 'At least one section is required'),
     learningObjectives: z.array(z.string().min(1, 'Learning objective cannot be empty')).min(1, 'At least one learning objective is required'),
     exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required'),
});

export const lessonSchema = z.object({
     roadmapId: z.string().uuid('Invalid roadmap ID'),
     title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
     description: z.string().min(1, 'Description is required'),
     content: lessonContentSchema,
     orderIndex: z.number().int().min(0, 'Order index must be non-negative'),
     estimatedDuration: z.number().int().min(5, 'Duration must be at least 5 minutes').max(60, 'Duration must be less than 60 minutes'),
     difficultyLevel: z.number().int().min(1, 'Difficulty level must be at least 1').max(5, 'Difficulty level must be at most 5').default(1),
     prerequisites: z.array(z.string().uuid('Invalid prerequisite ID')).default([]),
     language: z.enum(['javascript', 'python', 'html'], {
          errorMap: () => ({ message: 'Invalid language' }),
     }),
     starterCode: z.string().nullable().optional(),
     testCases: z.array(testCaseSchema).nullable().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CodeExecutionInput = z.infer<typeof codeExecutionSchema>;
export type CodeSaveInput = z.infer<typeof codeSaveSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type RoadmapGenerationInput = z.infer<typeof roadmapGenerationSchema>;
export type RoadmapPivotInput = z.infer<typeof roadmapPivotSchema>;
export type ProjectSubmissionInput = z.infer<typeof projectSubmissionSchema>;
export type EmailPreferencesInput = z.infer<typeof emailPreferencesSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type NpsInput = z.infer<typeof npsSchema>;
export type LessonContentInput = z.infer<typeof lessonContentSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type TestCaseInput = z.infer<typeof testCaseSchema>;
