import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
               <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                         <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                         <p className="mt-2 text-gray-600">Sign in to continue your learning journey</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                         <LoginForm />

                         <div className="mt-6 text-center space-y-2">
                              <Link
                                   href="/reset-password"
                                   className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                   Forgot your password?
                              </Link>
                              <p className="text-sm text-gray-600">
                                   Don't have an account?{' '}
                                   <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                                        Sign up
                                   </Link>
                              </p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
