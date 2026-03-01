import Navigation from "./Navigation";

interface MainLayoutProps {
     children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
     return (
          <div className="min-h-screen flex flex-col">
               <Navigation />
               <main className="flex-1">{children}</main>
               <footer className="bg-surface border-t border-border py-6 sm:py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="text-center text-text-secondary text-sm">
                              <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} CodePath AI. All rights reserved.</p>
                              <p className="mt-2 text-sm">Your personal AI coding mentor</p>
                         </div>
                    </div>
               </footer>
          </div>
     );
}
