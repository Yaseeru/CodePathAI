'use client';

/**
 * Email Preferences Component
 * Allows users to manage their re-engagement email preferences
 */

import { useState } from 'react';

interface EmailPreferencesProps {
     userId: string;
     initialEnabled: boolean;
     lastEmailSentAt: string | null;
}

export default function EmailPreferences({
     userId,
     initialEnabled,
     lastEmailSentAt,
}: EmailPreferencesProps) {
     const [enabled, setEnabled] = useState(initialEnabled);
     const [saving, setSaving] = useState(false);
     const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
          null
     );

     const handleToggle = async () => {
          setSaving(true);
          setMessage(null);

          try {
               const response = await fetch('/api/settings/email-preferences', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         reengagementEmailsEnabled: !enabled,
                    }),
               });

               if (!response.ok) {
                    throw new Error('Failed to update preferences');
               }

               setEnabled(!enabled);
               setMessage({
                    type: 'success',
                    text: 'Email preferences updated successfully',
               });
          } catch (error) {
               console.error('Error updating email preferences:', error);
               setMessage({
                    type: 'error',
                    text: 'Failed to update email preferences. Please try again.',
               });
          } finally {
               setSaving(false);
          }
     };

     const formatDate = (dateString: string | null) => {
          if (!dateString) return 'Never';
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'long',
               day: 'numeric',
          });
     };

     return (
          <div className="space-y-6">
               <div>
                    <h2 className="text-lg font-medium text-gray-900">Email Preferences</h2>
                    <p className="mt-1 text-sm text-gray-500">
                         Manage how we communicate with you via email
                    </p>
               </div>

               <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-start justify-between">
                         <div className="flex-1">
                              <h3 className="text-base font-medium text-gray-900">
                                   Re-engagement Emails
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                   Receive reminder emails when you haven't logged in for a few days.
                                   These emails help you stay on track with your learning goals.
                              </p>
                              {lastEmailSentAt && (
                                   <p className="mt-2 text-xs text-gray-400">
                                        Last email sent: {formatDate(lastEmailSentAt)}
                                   </p>
                              )}
                         </div>

                         <div className="ml-6 flex-shrink-0">
                              <button
                                   type="button"
                                   onClick={handleToggle}
                                   disabled={saving}
                                   className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                                   role="switch"
                                   aria-checked={enabled}
                              >
                                   <span className="sr-only">Enable re-engagement emails</span>
                                   <span
                                        className={`${enabled ? 'translate-x-5' : 'translate-x-0'
                                             } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                   />
                              </button>
                         </div>
                    </div>

                    {message && (
                         <div
                              className={`mt-4 rounded-md p-4 ${message.type === 'success'
                                        ? 'bg-green-50 text-green-800'
                                        : 'bg-red-50 text-red-800'
                                   }`}
                         >
                              <p className="text-sm">{message.text}</p>
                         </div>
                    )}
               </div>

               <div className="border-t border-gray-200 pt-6">
                    <div className="text-sm text-gray-500">
                         <p>
                              <strong>Note:</strong> We respect your privacy and will only send you
                              emails related to your learning progress. You can change these
                              preferences at any time.
                         </p>
                         <p className="mt-2">
                              Re-engagement emails are sent at most once every 3 days when you've been
                              inactive.
                         </p>
                    </div>
               </div>
          </div>
     );
}
