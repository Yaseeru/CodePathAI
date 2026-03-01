import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
               <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                         <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Welcome back</h1>
                         <p className="text-base text-gray-600">Sign in to continue your learning journey</p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
                         <LoginForm />

                         <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
                              <Link
                                   href="/reset-password"
                                   className="block text-sm text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                   Forgot your password?
                              </Link>
                              <p className="text-sm text-gray-600">
                                   Don't have an account?{' '}
                                   <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                        Sign up
                                   </Link>
                              </p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
