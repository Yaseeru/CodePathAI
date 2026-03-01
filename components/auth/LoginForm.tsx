'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
     email: z.string().email('Invalid email address'),
     password: z.string().min(1, 'Password is required'),
});

interface LoginFormProps {
     onSuccess?: () => void;
     redirectTo?: string;
}

export default function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
     const router = useRouter();
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

     const validateForm = () => {
          try {
               loginSchema.parse({ email, password });
               setFieldErrors({});
               return true;
          } catch (err) {
               if (err instanceof z.ZodError) {
                    const errors: { email?: string; password?: string } = {};
                    err.errors.forEach((error) => {
                         if (error.path[0]) {
                              errors[error.path[0] as 'email' | 'password'] = error.message;
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

          if (!validateForm()) {
               return;
          }

          setLoading(true);

          try {
               const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
               });

               const data = await response.json();

               if (!response.ok) {
                    setError(data.error || 'Login failed');
                    return;
               }

               // Check if onboarding is completed
               if (data.user.onboardingCompleted) {
                    router.push(redirectTo);
               } else {
                    router.push('/onboarding');
               }

               if (onSuccess) {
                    onSuccess();
               }
          } catch (err) {
               console.error('Login error:', err);
               setError('An unexpected error occurred');
          } finally {
               setLoading(false);
          }
     };

     return (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
               {error && (
                    <div
                         className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
                         role="alert"
                         aria-live="polite"
                    >
                         {error}
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
                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-colors ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                              }`}
                         placeholder="you@example.com"
                         disabled={loading}
                         aria-invalid={!!fieldErrors.email}
                         aria-describedby={fieldErrors.email ? "email-error" : undefined}
                         autoComplete="email"
                    />
                    {fieldErrors.email && (
                         <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                              {fieldErrors.email}
                         </p>
                    )}
               </div>

               <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                         Password
                    </label>
                    <input
                         id="password"
                         type="password"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-colors ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                              }`}
                         placeholder="••••••••"
                         disabled={loading}
                         aria-invalid={!!fieldErrors.password}
                         aria-describedby={fieldErrors.password ? "password-error" : undefined}
                         autoComplete="current-password"
                    />
                    {fieldErrors.password && (
                         <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
                              {fieldErrors.password}
                         </p>
                    )}
               </div>

               <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6"
                    aria-busy={loading}
               >
                    {loading ? 'Logging in...' : 'Log in'}
               </button>
          </form>
     );
}
