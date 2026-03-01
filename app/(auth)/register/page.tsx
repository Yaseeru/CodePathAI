import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
               <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                         <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
                         <p className="mt-2 text-gray-600">Start your personalized coding journey today</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                         <RegisterForm />

                         <div className="mt-6 text-center">
                              <p className="text-sm text-gray-600">
                                   Already have an account?{' '}
                                   <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                        Sign in
                                   </Link>
                              </p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
