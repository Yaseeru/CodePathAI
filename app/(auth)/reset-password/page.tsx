import Link from 'next/link';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
               <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                         <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Reset your password</h1>
                         <p className="text-base text-gray-600">We'll send you a link to reset your password</p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
                         <ResetPasswordForm />

                         <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                                   Back to login
                              </Link>
                         </div>
                    </div>
               </div>
          </div>
     );
}
