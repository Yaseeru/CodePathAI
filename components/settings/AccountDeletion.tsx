'use client';

import { useState } from 'react';

export function AccountDeletion() {
     const [showConfirmation, setShowConfirmation] = useState(false);
     const [confirmationText, setConfirmationText] = useState('');
     const [isDeleting, setIsDeleting] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const handleDeleteAccount = async () => {
          if (confirmationText !== 'DELETE_MY_ACCOUNT') {
               setError('Please type "DELETE_MY_ACCOUNT" to confirm');
               return;
          }

          setIsDeleting(true);
          setError(null);

          try {
               const response = await fetch('/api/user/account', {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         confirmation: confirmationText,
                    }),
               });

               if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to delete account');
               }

               // Account deleted successfully - redirect to goodbye page
               window.location.href = '/goodbye';
          } catch (err) {
               setError(err instanceof Error ? err.message : 'Failed to delete account');
               setIsDeleting(false);
          }
     };

     return (
          <div className="bg-white rounded-lg shadow p-6">
               <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Account</h2>

               <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-800">
                         <strong>Warning:</strong> This action cannot be undone. Deleting your account will permanently remove:
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-800 mt-2 space-y-1">
                         <li>Your profile and account information</li>
                         <li>All your learning roadmaps and progress</li>
                         <li>All your project submissions and code</li>
                         <li>All your chat conversations with the AI mentor</li>
                         <li>All your activity history and analytics</li>
                    </ul>
               </div>

               {!showConfirmation ? (
                    <button
                         onClick={() => setShowConfirmation(true)}
                         className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                         Delete My Account
                    </button>
               ) : (
                    <div className="space-y-4">
                         <div>
                              <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                   Type <code className="bg-gray-100 px-2 py-1 rounded">DELETE_MY_ACCOUNT</code> to confirm:
                              </label>
                              <input
                                   id="confirmation"
                                   type="text"
                                   value={confirmationText}
                                   onChange={(e) => setConfirmationText(e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                   placeholder="DELETE_MY_ACCOUNT"
                                   disabled={isDeleting}
                              />
                         </div>

                         {error && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                   <p className="text-sm text-red-800">{error}</p>
                              </div>
                         )}

                         <div className="flex gap-3">
                              <button
                                   onClick={handleDeleteAccount}
                                   disabled={isDeleting || confirmationText !== 'DELETE_MY_ACCOUNT'}
                                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                   {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                              </button>
                              <button
                                   onClick={() => {
                                        setShowConfirmation(false);
                                        setConfirmationText('');
                                        setError(null);
                                   }}
                                   disabled={isDeleting}
                                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                              >
                                   Cancel
                              </button>
                         </div>
                    </div>
               )}
          </div>
     );
}
