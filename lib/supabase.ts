import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './types/database';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
     throw new Error('Missing Supabase environment variables');
}

/**
 * Creates a Supabase client for server-side operations
 * This client uses cookies for authentication state
 */
export function createServerClient() {
     const cookieStore = cookies();

     return createClient<Database>(supabaseUrl, supabaseAnonKey, {
          auth: {
               persistSession: true,
               autoRefreshToken: true,
               detectSessionInUrl: false,
               storage: {
                    getItem: async (key: string) => {
                         const cookie = (await cookieStore).get(key);
                         return cookie?.value ?? null;
                    },
                    setItem: async (key: string, value: string) => {
                         (await cookieStore).set(key, value, {
                              httpOnly: true,
                              secure: process.env.NODE_ENV === 'production',
                              sameSite: 'lax',
                              maxAge: 60 * 60 * 24 * 7, // 7 days
                              path: '/',
                         });
                    },
                    removeItem: async (key: string) => {
                         (await cookieStore).delete(key);
                    },
               },
          },
     });
}

/**
 * Creates a Supabase client for client-side operations
 * This client uses localStorage for authentication state
 */
export function createBrowserClient() {
     return createClient<Database>(supabaseUrl, supabaseAnonKey, {
          auth: {
               persistSession: true,
               autoRefreshToken: true,
               detectSessionInUrl: true,
          },
     });
}

/**
 * Creates a Supabase admin client with service role privileges
 * This bypasses Row Level Security and should only be used for admin operations
 * WARNING: Only use this for trusted server-side operations
 */
export function createAdminClient() {
     if (!supabaseServiceRoleKey) {
          throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
     }

     return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
               persistSession: false,
               autoRefreshToken: false,
          },
     });
}

/**
 * Gets the current authenticated user from the server
 * @returns User object or null if not authenticated
 */
export async function getUser() {
     const supabase = createServerClient();

     try {
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error) {
               console.error('Error fetching user:', error);
               return null;
          }

          return user;
     } catch (error) {
          console.error('Unexpected error fetching user:', error);
          return null;
     }
}

/**
 * Gets the current session from the server
 * @returns Session object or null if no active session
 */
export async function getSession() {
     const supabase = createServerClient();

     try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
               console.error('Error fetching session:', error);
               return null;
          }

          return session;
     } catch (error) {
          console.error('Unexpected error fetching session:', error);
          return null;
     }
}
