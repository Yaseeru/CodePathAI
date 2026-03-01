'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardNav() {
     const pathname = usePathname();
     const router = useRouter();
     const [isMenuOpen, setIsMenuOpen] = useState(false);

     const handleLogout = async () => {
          try {
               await fetch('/api/auth/logout', { method: 'POST' });
               router.push('/login');
          } catch (error) {
               console.error('Logout error:', error);
          }
     };

     const navItems = [
          { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
          { href: '/roadmap', label: 'Roadmap', icon: '🗺️' },
          { href: '/progress', label: 'Progress', icon: '📊' },
          { href: '/chat', label: 'AI Mentor', icon: '💬' },
          { href: '/settings', label: 'Settings', icon: '⚙️' },
     ];

     return (
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                         {/* Logo */}
                         <Link href="/dashboard" className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                   <span className="text-white font-bold text-lg">C</span>
                              </div>
                              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                                   CodePath AI
                              </span>
                         </Link>

                         {/* Desktop Navigation */}
                         <div className="hidden md:flex items-center space-x-1">
                              {navItems.map((item) => (
                                   <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                                                  ? 'bg-blue-50 text-blue-600'
                                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                             }`}
                                   >
                                        <span className="mr-2">{item.icon}</span>
                                        {item.label}
                                   </Link>
                              ))}
                              <button
                                   onClick={handleLogout}
                                   className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                   Logout
                              </button>
                         </div>

                         {/* Mobile menu button */}
                         <button
                              onClick={() => setIsMenuOpen(!isMenuOpen)}
                              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                         >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                   ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                   )}
                              </svg>
                         </button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                         <div className="md:hidden py-4 border-t border-gray-200">
                              {navItems.map((item) => (
                                   <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                                                  ? 'bg-blue-50 text-blue-600'
                                                  : 'text-gray-600 hover:bg-gray-50'
                                             }`}
                                   >
                                        <span className="mr-2">{item.icon}</span>
                                        {item.label}
                                   </Link>
                              ))}
                              <button
                                   onClick={handleLogout}
                                   className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                              >
                                   Logout
                              </button>
                         </div>
                    )}
               </div>
          </nav>
     );
}
