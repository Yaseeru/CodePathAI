import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
               <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                         <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Create your account</h1>
                         <p className="text-base text-gray-600">Start your personalized coding journey today</p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
                         <RegisterForm />

                         <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                              <p className="text-sm text-gray-600">
                                   Already have an account?{' '}
                                   <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                        Sign in
                                   </Link>
                              </p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
