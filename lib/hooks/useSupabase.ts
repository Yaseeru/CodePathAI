'use client';

import { createBrowserClient } from '@/lib/supabase';
import { useMemo } from 'react';

/**
 * Hook to get Supabase client instance for client-side operations
 * Creates a memoized client to avoid recreating on every render
 */
export function useSupabase() {
     const supabase = useMemo(() => createBrowserClient(), []);
     return supabase;
}
