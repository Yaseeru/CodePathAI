"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useEscapeKey, useKeyboardShortcuts } from "@/lib/hooks/useKeyboardNavigation";
import { useRouter } from "next/navigation";

export default function Navigation() {
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
     const router = useRouter();
     const mobileMenuRef = useRef<HTMLDivElement>(null);

     // Close mobile menu on Escape key
     useEscapeKey(() => {
          if (isMobileMenuOpen) {
               setIsMobileMenuOpen(false);
          }
     }, isMobileMenuOpen);

     // Global keyboard shortcuts for navigation
     useKeyboardShortcuts([
          {
               key: '1',
               altKey: true,
               description: 'Navigate to Dashboard',
               action: () => router.push('/dashboard'),
          },
          {
               key: '2',
               altKey: true,
               description: 'Navigate to Roadmap',
               action: () => router.push('/roadmap'),
          },
          {
               key: '3',
               altKey: true,
               description: 'Navigate to Progress',
               action: () => router.push('/progress'),
          },
     ]);

     // Close mobile menu when clicking outside
     useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
               if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                    setIsMobileMenuOpen(false);
               }
          };

          if (isMobileMenuOpen) {
               document.addEventListener('mousedown', handleClickOutside);
               return () => document.removeEventListener('mousedown', handleClickOutside);
          }
     }, [isMobileMenuOpen]);

     return (
          <nav className="bg-surface border-b border-border sticky top-0 z-50" role="navigation" aria-label="Main navigation">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile-first: min-h-[44px] ensures touch target size */}
                    <div className="flex justify-between items-center h-16 lg:h-20">
                         {/* Logo - responsive sizing */}
                         <div className="flex items-center">
                              <Link
                                   href="/"
                                   className="flex items-center space-x-3 min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg px-2 -mx-2"
                                   aria-label="CodePath AI Home"
                              >
                                   <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                                        <span className="text-white font-bold text-lg lg:text-xl" aria-hidden="true">C</span>
                                   </div>
                                   <span className="text-xl lg:text-2xl font-bold text-text-primary hidden sm:inline">
                                        CodePath AI
                                   </span>
                              </Link>
                         </div>

                         {/* Desktop Navigation - hidden on mobile and tablet */}
                         <div className="hidden lg:flex items-center space-x-8" role="menubar">
                              <Link
                                   href="/dashboard"
                                   className="text-text-secondary hover:text-text-primary transition-colors text-sm lg:text-base py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                                   role="menuitem"
                              >
                                   Dashboard
                              </Link>
                              <Link
                                   href="/roadmap"
                                   className="text-text-secondary hover:text-text-primary transition-colors text-sm lg:text-base py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                                   role="menuitem"
                              >
                                   Roadmap
                              </Link>
                              <Link
                                   href="/progress"
                                   className="text-text-secondary hover:text-text-primary transition-colors text-sm lg:text-base py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                                   role="menuitem"
                              >
                                   Progress
                              </Link>
                         </div>

                         {/* Desktop Auth Buttons */}
                         <div className="hidden lg:flex items-center space-x-4">
                              <Link
                                   href="/login"
                                   className="text-text-secondary hover:text-text-primary transition-colors text-sm lg:text-base py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                              >
                                   Log In
                              </Link>
                              <Link
                                   href="/register"
                                   className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                              >
                                   Get Started
                              </Link>
                         </div>

                         {/* Mobile Menu Button - 44x44px touch target */}
                         <button
                              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                              className="lg:hidden p-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                              aria-expanded={isMobileMenuOpen}
                              aria-controls="mobile-menu"
                         >
                              <svg
                                   className="w-6 h-6"
                                   fill="none"
                                   stroke="currentColor"
                                   viewBox="0 0 24 24"
                                   aria-hidden="true"
                              >
                                   {isMobileMenuOpen ? (
                                        <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M6 18L18 6M6 6l12 12"
                                        />
                                   ) : (
                                        <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M4 6h16M4 12h16M4 18h16"
                                        />
                                   )}
                              </svg>
                         </button>
                    </div>

                    {/* Mobile Menu - slide down animation */}
                    {isMobileMenuOpen && (
                         <div
                              id="mobile-menu"
                              ref={mobileMenuRef}
                              className="lg:hidden py-4 space-y-2 border-t border-border mt-2"
                              role="menu"
                              aria-label="Mobile navigation menu"
                         >
                              <Link
                                   href="/dashboard"
                                   className="block text-text-secondary hover:text-text-primary transition-colors py-3 px-2 rounded-lg hover:bg-surface min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                   onClick={() => setIsMobileMenuOpen(false)}
                                   role="menuitem"
                              >
                                   Dashboard
                              </Link>
                              <Link
                                   href="/roadmap"
                                   className="block text-text-secondary hover:text-text-primary transition-colors py-3 px-2 rounded-lg hover:bg-surface min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                   onClick={() => setIsMobileMenuOpen(false)}
                                   role="menuitem"
                              >
                                   Roadmap
                              </Link>
                              <Link
                                   href="/progress"
                                   className="block text-text-secondary hover:text-text-primary transition-colors py-3 px-2 rounded-lg hover:bg-surface min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                   onClick={() => setIsMobileMenuOpen(false)}
                                   role="menuitem"
                              >
                                   Progress
                              </Link>
                              <div className="pt-4 border-t border-border space-y-2">
                                   <Link
                                        href="/login"
                                        className="block text-text-secondary hover:text-text-primary transition-colors py-3 px-2 rounded-lg hover:bg-surface min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        role="menuitem"
                                   >
                                        Log In
                                   </Link>
                                   <Link
                                        href="/register"
                                        className="block bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors text-center min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        role="menuitem"
                                   >
                                        Get Started
                                   </Link>
                              </div>
                         </div>
                    )}
               </div>
          </nav>
     );
}
