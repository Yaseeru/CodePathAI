'use client';

import { useState } from 'react';
import { z } from 'zod';

// Validation schema
const resetPasswordSchema = z.object({
     email: z.string().email('Invalid email address'),
});

interface ResetPasswordFormProps {
     onSuccess?: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
     const [email, setEmail] = useState('');
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const [success, setSuccess] = useState(false);
     const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});

     const validateForm = () => {
          try {
               resetPasswordSchema.parse({ email });
               setFieldErrors({});
               return true;
          } catch (err) {
               if (err instanceof z.ZodError) {
                    const errors: { email?: string } = {};
                    err.errors.forEach((error) => {
                         if (error.path[0]) {
                              errors[error.path[0] as 'email'] = error.message;
                         }
                    });
                    setFieldErrors(errors);
               }
               return false;
          }
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setError('');
          setSuccess(false);

          if (!validateForm()) {
               return;
          }

          setLoading(true);

          try {
               const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
               });

               const data = await response.json();

               if (!response.ok) {
                    setError(data.error || 'Failed to send reset email');
                    return;
               }

               setSuccess(true);
               setEmail('');

               if (onSuccess) {
                    onSuccess();
               }
          } catch (err) {
               console.error('Password reset error:', err);
               setError('An unexpected error occurred');
          } finally {
               setLoading(false);
          }
     };

     return (
          <form onSubmit={handleSubmit} className="space-y-6">
               {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                         {error}
                    </div>
               )}

               {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                         If an account exists with this email, a password reset link has been sent. Please check
                         your inbox.
                    </div>
               )}

               <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                         Email
                    </label>
                    <input
                         id="email"
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                              }`}
                         placeholder="you@example.com"
                         disabled={loading}
                    />
                    {fieldErrors.email && (
                         <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-600">
                         Enter your email address and we'll send you a link to reset your password.
                    </p>
               </div>

               <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                    {loading ? 'Sending...' : 'Send reset link'}
               </button>
          </form>
     );
}
