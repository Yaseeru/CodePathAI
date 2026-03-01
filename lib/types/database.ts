/**
 * Database types for Supabase
 * These types represent the actual database schema
 */

export type Json =
     | string
     | number
     | boolean
     | null
     | { [key: string]: Json | undefined }
     | Json[]

export interface Database {
     public: {
          Tables: {
               user_profiles: {
                    Row: {
                         id: string
                         name: string
                         email: string
                         learning_goal: string | null
                         time_commitment: number | null
                         experience_level: string | null
                         onboarding_completed: boolean
                         created_at: string
                         updated_at: string
                    }
                    Insert: {
                         id: string
                         name: string
                         email: string
                         learning_goal?: string | null
                         time_commitment?: number | null
                         experience_level?: string | null
                         onboarding_completed?: boolean
                         created_at?: string
                         updated_at?: string
                    }
                    Update: {
                         id?: string
                         name?: string
                         email?: string
                         learning_goal?: string | null
                         time_commitment?: number | null
                         experience_level?: string | null
                         onboarding_completed?: boolean
                         created_at?: string
                         updated_at?: string
                    }
               }
               roadmaps: {
                    Row: {
                         id: string
                         user_id: string
                         title: string
                         description: string
                         goal: string
                         status: string
                         created_at: string
                         updated_at: string
                    }
                    Insert: {
                         id?: string
                         user_id: string
                         title: string
                         description: string
                         goal: string
                         status?: string
                         created_at?: string
                         updated_at?: string
                    }
                    Update: {
                         id?: string
                         user_id?: string
                         title?: string
                         description?: string
                         goal?: string
                         status?: string
                         created_at?: string
                         updated_at?: string
                    }
               }
               lessons: {
                    Row: {
                         id: string
                         roadmap_id: string
                         title: string
                         description: string
                         content: Json
                         order_index: number
                         estimated_duration: number
                         difficulty_level: number
                         prerequisites: string[]
                         language: string
                         starter_code: string | null
                         test_cases: Json | null
                         created_at: string
                         updated_at: string
                    }
                    Insert: {
                         id?: string
                         roadmap_id: string
                         title: string
                         description: string
                         content: Json
                         order_index: number
                         estimated_duration: number
                         difficulty_level?: number
                         prerequisites?: string[]
                         language: string
                         starter_code?: string | null
                         test_cases?: Json | null
                         created_at?: string
                         updated_at?: string
                    }
                    Update: {
                         id?: string
                         roadmap_id?: string
                         title?: string
                         description?: string
                         content?: Json
                         order_index?: number
                         estimated_duration?: number
                         difficulty_level?: number
                         prerequisites?: string[]
                         language?: string
                         starter_code?: string | null
                         test_cases?: Json | null
                         created_at?: string
                         updated_at?: string
                    }
               }
               projects: {
                    Row: {
                         id: string
                         roadmap_id: string
                         title: string
                         description: string
                         requirements: Json
                         success_criteria: Json
                         order_index: number
                         estimated_duration: number
                         unlock_after_lesson: string | null
                         created_at: string
                         updated_at: string
                    }
                    Insert: {
                         id?: string
                         roadmap_id: string
                         title: string
                         description: string
                         requirements: Json
                         success_criteria: Json
                         order_index: number
                         estimated_duration: number
                         unlock_after_lesson?: string | null
                         created_at?: string
                         updated_at?: string
                    }
                    Update: {
                         id?: string
                         roadmap_id?: string
                         title?: string
                         description?: string
                         requirements?: Json
                         success_criteria?: Json
                         order_index?: number
                         estimated_duration?: number
                         unlock_after_lesson?: string | null
                         created_at?: string
                         updated_at?: string
                    }
               }
               user_progress: {
                    Row: {
                         user_id: string
                         current_roadmap_id: string | null
                         current_lesson_id: string | null
                         total_lessons_completed: number
                         total_projects_completed: number
                         total_learning_time: number
                         current_streak: number
                         longest_streak: number
                         last_activity_date: string | null
                         difficulty_level: number
                         created_at: string
                         updated_at: string
                    }
                    Insert: {
                         user_id: string
                         current_roadmap_id?: string | null
                         current_lesson_id?: string | null
                         total_lessons_completed?: number
                         total_projects_completed?: number
                         total_learning_time?: number
                         current_streak?: number
                         longest_streak?: number
                         last_activity_date?: string | null
                         difficulty_level?: number
                         created_at?: string
                         updated_at?: string
                    }
                    Update: {
                         user_id?: string
                         current_roadmap_id?: string | null
                         current_lesson_id?: string | null
                         total_lessons_completed?: number
                         total_projects_completed?: number
                         total_learning_time?: number
                         current_streak?: number
                         longest_streak?: number
                         last_activity_date?: string | null
                         difficulty_level?: number
                         created_at?: string
                         updated_at?: string
                    }
               }
               lesson_progress: {
                    Row: {
                         id: string
                         user_id: string
                         lesson_id: string
                         status: string
                         started_at: string | null
                         completed_at: string | null
                         completion_time: number | null
                         attempts: number
                         error_count: number
                         created_at: string
                         updated_at: string
                    }
                    Insert: {
                         id?: string
                         user_id: string
                         lesson_id: string
                         status?: string
                         started_at?: string | null
                         completed_at?: string | null
                         completion_time?: number | null
                         attempts?: number
                         error_count?: number
                         created_at?: string
                         updated_at?: string
                    }
                    Update: {
                         id?: string
                         user_id?: string
                         lesson_id?: string
                         status?: string
                         started_at?: string | null
                         completed_at?: string | null
                         completion_time?: number | null
                         attempts?: number
                         error_count?: number
                         created_at?: string
                         updated_at?: string
                    }
               }
               conversations: {
                    Row: {
                         id: string
                         user_id: string
                         lesson_id: string | null
                         title: string | null
                         created_at: string
                         updated_at: string
                    }
                    Insert: {
                         id?: string
                         user_id: string
                         lesson_id?: string | null
                         title?: string | null
                         created_at?: string
                         updated_at?: string
                    }
                    Update: {
                         id?: string
                         user_id?: string
                         lesson_id?: string | null
                         title?: string | null
                         created_at?: string
                         updated_at?: string
                    }
               }
               messages: {
                    Row: {
                         id: string
                         conversation_id: string
                         role: string
                         content: string
                         context_snapshot: Json | null
                         created_at: string
                    }
                    Insert: {
                         id?: string
                         conversation_id: string
                         role: string
                         content: string
                         context_snapshot?: Json | null
                         created_at?: string
                    }
                    Update: {
                         id?: string
                         conversation_id?: string
                         role?: string
                         content?: string
                         context_snapshot?: Json | null
                         created_at?: string
                    }
               }
          }
          Views: {
               [_ in never]: never
          }
          Functions: {
               [_ in never]: never
          }
          Enums: {
               [_ in never]: never
          }
     }
}
