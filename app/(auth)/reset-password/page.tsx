import Link from 'next/link';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
               <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                         <h1 className="text-3xl font-bold text-gray-900">Reset your password</h1>
                         <p className="mt-2 text-gray-600">We'll send you a link to reset your password</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                         <ResetPasswordForm />

                         <div className="mt-6 text-center">
                              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
                                   Back to login
                              </Link>
                         </div>
                    </div>
               </div>
          </div>
     );
}
