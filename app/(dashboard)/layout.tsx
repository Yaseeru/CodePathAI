import { requireAuth } from '@/lib/auth/utils';
import DashboardNav from '@/components/layout/DashboardNav';

export default async function DashboardLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     // Ensure user is authenticated for all dashboard routes
     await requireAuth();

     return (
          <div className="min-h-screen bg-gray-50">
               <DashboardNav />
               <main className="pb-8">
                    {children}
               </main>
          </div>
     );
}
