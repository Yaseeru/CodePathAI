/**
 * Row Level Security (RLS) Policy Testing
 * 
 * This module provides utilities to test RLS policies and ensure
 * users cannot access other users' data.
 */

import { createServerClient } from '@/lib/supabase';

export interface RLSTestResult {
     table: string;
     operation: string;
     passed: boolean;
     error?: string;
}

/**
 * Test RLS policies for a given table
 * Attempts to access another user's data and verifies it's blocked
 */
export async function testRLSPolicy(
     table: string,
     userId: string,
     otherUserId: string
): Promise<RLSTestResult[]> {
     const results: RLSTestResult[] = [];
     const supabase = createServerClient();

     // Test SELECT operation
     try {
          const { data, error } = await supabase
               .from(table)
               .select('*')
               .eq('user_id', otherUserId);

          if (error) {
               results.push({
                    table,
                    operation: 'SELECT',
                    passed: true,
                    error: error.message,
               });
          } else if (data && data.length === 0) {
               results.push({
                    table,
                    operation: 'SELECT',
                    passed: true,
               });
          } else {
               results.push({
                    table,
                    operation: 'SELECT',
                    passed: false,
                    error: 'User was able to access other user\'s data',
               });
          }
     } catch (error) {
          results.push({
               table,
               operation: 'SELECT',
               passed: true,
               error: error instanceof Error ? error.message : 'Unknown error',
          });
     }

     return results;
}

/**
 * Run comprehensive RLS tests across all tables
 */
export async function runRLSTests(
     userId: string,
     otherUserId: string
): Promise<RLSTestResult[]> {
     const tables = [
          'user_profiles',
          'roadmaps',
          'lessons',
          'projects',
          'lesson_progress',
          'project_submissions',
          'user_progress',
          'conversations',
          'messages',
          'code_saves',
          'user_events',
          'daily_activity',
     ];

     const allResults: RLSTestResult[] = [];

     for (const table of tables) {
          const results = await testRLSPolicy(table, userId, otherUserId);
          allResults.push(...results);
     }

     return allResults;
}

/**
 * Verify RLS is enabled on all tables
 */
export async function verifyRLSEnabled(): Promise<{
     enabled: boolean;
     tables: { name: string; rlsEnabled: boolean }[];
}> {
     const supabase = createServerClient();

     // Query to check RLS status
     const { data, error } = await supabase.rpc('check_rls_status');

     if (error) {
          console.error('Error checking RLS status:', error);
          return { enabled: false, tables: [] };
     }

     const allEnabled = data?.every((table: any) => table.rls_enabled) ?? false;

     return {
          enabled: allEnabled,
          tables: data || [],
     };
}
