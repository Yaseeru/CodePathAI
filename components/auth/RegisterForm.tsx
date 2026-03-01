'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { validatePasswordStrength } from '@/lib/auth/utils';

// Validation schema
const registerSchema = z.object({
     name: z.string().min(2, 'Name must be at least 2 characters').max(100),
     email: z.string().email('Invalid email address'),
     password: z.string().min(8, 'Password must be at least 8 characters'),
     confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
     message: "Passwords don't match",
     path: ['confirmPassword'],
});

interface RegisterFormProps {
     onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
     const router = useRouter();
     const [name, setName] = useState('');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const [fieldErrors, setFieldErrors] = useState<{
          name?: string;
          email?: string;
          password?: string;
          confirmPassword?: string;
     }>({});

     // Password strength indicator
     const passwordStrength = password ? validatePasswordStrength(password) : null;

     const getStrengthColor = (strength: number) => {
          if (strength === 0) return 'bg-gray-200';
          if (strength === 1) return 'bg-red-500';
          if (strength === 2) return 'bg-orange-500';
          if (strength === 3) return 'bg-yellow-500';
          return 'bg-green-500';
     };

     const getStrengthText = (strength: number) => {
          if (strength === 0) return 'Too weak';
          if (strength === 1) return 'Weak';
          if (strength === 2) return 'Fair';
          if (strength === 3) return 'Good';
          return 'Strong';
     };

     const validateForm = () => {
          try {
               registerSchema.parse({ name, email, password, confirmPassword });
               setFieldErrors({});
               return true;
          } catch (err) {
               if (err instanceof z.ZodError) {
                    const errors: {
                         name?: string;
                         email?: string;
                         password?: string;
                         confirmPassword?: string;
                    } = {};
                    err.errors.forEach((error) => {
                         if (error.path[0]) {
                              errors[error.path[0] as keyof typeof errors] = error.message;
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

          // Check password strength
          if (passwordStrength && !passwordStrength.isValid) {
               setError('Password is too weak. Please use a stronger password.');
               return;
          }

          setLoading(true);

          try {
               const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password }),
               });

               const data = await response.json();

               if (!response.ok) {
                    setError(data.error || 'Registration failed');
                    return;
               }

               // Redirect to onboarding after successful registration
               router.push('/onboarding');

               if (onSuccess) {
                    onSuccess();
               }
          } catch (err) {
               console.error('Registration error:', err);
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

               <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                         Name
                    </label>
                    <input
                         id="name"
                         type="text"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                              }`}
                         placeholder="John Doe"
                         disabled={loading}
                    />
                    {fieldErrors.name && (
                         <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                    )}
               </div>

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
                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                              }`}
                         placeholder="••••••••"
                         disabled={loading}
                    />
                    {fieldErrors.password && (
                         <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                    )}

                    {/* Password strength indicator */}
                    {password && passwordStrength && (
                         <div className="mt-2">
                              <div className="flex gap-1 mb-1">
                                   {[...Array(4)].map((_, i) => (
                                        <div
                                             key={i}
                                             className={`h-1 flex-1 rounded ${i < passwordStrength.strength
                                                       ? getStrengthColor(passwordStrength.strength)
                                                       : 'bg-gray-200'
                                                  }`}
                                        />
                                   ))}
                              </div>
                              <p className="text-xs text-gray-600">
                                   Strength: {getStrengthText(passwordStrength.strength)}
                              </p>
                              {passwordStrength.feedback.length > 0 && (
                                   <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                                        {passwordStrength.feedback.map((feedback, i) => (
                                             <li key={i}>{feedback}</li>
                                        ))}
                                   </ul>
                              )}
                         </div>
                    )}
               </div>

               <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                         Confirm Password
                    </label>
                    <input
                         id="confirmPassword"
                         type="password"
                         value={confirmPassword}
                         onChange={(e) => setConfirmPassword(e.target.value)}
                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                              }`}
                         placeholder="••••••••"
                         disabled={loading}
                    />
                    {fieldErrors.confirmPassword && (
                         <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                    )}
               </div>

               <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                    {loading ? 'Creating account...' : 'Create account'}
               </button>
          </form>
     );
}
