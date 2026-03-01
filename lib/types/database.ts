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
