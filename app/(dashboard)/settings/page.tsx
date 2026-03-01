/**
 * Settings Page
 * User settings including email preferences
 */

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import EmailPreferences from '@/components/settings/EmailPreferences';

export default async function SettingsPage() {
     const supabase = createServerClient();

     const {
          data: { user },
     } = await supabase.auth.getUser();

     if (!user) {
          redirect('/login');
     }

     // Fetch user profile
     const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

     if (!profile) {
          redirect('/onboarding');
     }

     return (
          <div className="min-h-screen bg-gray-50 py-8">
               <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg">
                         <div className="px-6 py-5 border-b border-gray-200">
                              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                              <p className="mt-1 text-sm text-gray-500">
                                   Manage your account settings and preferences
                              </p>
                         </div>

                         <div className="px-6 py-6">
                              <EmailPreferences
                                   userId={user.id}
                                   initialEnabled={profile.reengagement_emails_enabled}
                                   lastEmailSentAt={profile.last_reengagement_email_sent_at}
                              />
                         </div>
                    </div>
               </div>
          </div>
     );
}
