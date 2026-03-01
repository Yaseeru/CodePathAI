"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

     return (
          <nav className="bg-surface border-b border-border">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile-first: min-h-[44px] ensures touch target size */}
                    <div className="flex justify-between items-center h-14 sm:h-16">
                         {/* Logo - responsive sizing */}
                         <div className="flex items-center">
                              <Link href="/" className="flex items-center space-x-2 min-h-[44px] min-w-[44px]">
                                   <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-base sm:text-lg">C</span>
                                   </div>
                                   <span className="text-lg sm:text-xl font-bold text-text-primary hidden xs:inline">
                                        CodePath AI
                                   </span>
                              </Link>
                         </div>

                         {/* Desktop Navigation - hidden on mobile and tablet */}
                         <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                              <Link
                                   href="/dashboard"
                                   className="text-text-secondary hover:text-text-primary transition-colors text-sm lg:text-base py-2"
                              >
                                   Dashboard
                              </Link>
                              <Link
                                   href="/roadmap"
                                   className="text-text-secondary hover:text-text-primary transition-colors text-sm lg:text-base py-2"
                              >
                                   Roadmap
                              </Link>
                              <Link
                                   href="/progress"
                                   className="text-text-secondary hover:text-text-primary transition-colors text-sm lg:text-base py-2"
                              >
                                   Progress
                              </Link>
                         </div>

                         {/* Desktop Auth Buttons */}
                         <div className="hidden lg:flex items-center space-x-4">
                              <Link
                                   href="/login"
                                   className="text-text-secondary hover:text-text-primary transition-colors text-sm lg:text-base py-2"
                              >
                                   Log In
                              </Link>
                              <Link
                                   href="/register"
                                   className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm lg:text-base"
                              >
                                   Get Started
                              </Link>
                         </div>

                         {/* Mobile Menu Button - 44x44px touch target */}
                         <button
                              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                              className="lg:hidden p-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              aria-label="Toggle menu"
                              aria-expanded={isMobileMenuOpen}
                         >
                              <svg
                                   className="w-6 h-6"
                                   fill="none"
                                   stroke="currentColor"
                                   viewBox="0 0 24 24"
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
                         <div className="lg:hidden py-4 space-y-2 border-t border-border mt-2">
                              <Link
                                   href="/dashboard"
                                   className="block text-text-secondary hover:text-text-primary transition-colors py-3 px-2 rounded-lg hover:bg-surface min-h-[44px] flex items-center"
                                   onClick={() => setIsMobileMenuOpen(false)}
                              >
                                   Dashboard
                              </Link>
                              <Link
                                   href="/roadmap"
                                   className="block text-text-secondary hover:text-text-primary transition-colors py-3 px-2 rounded-lg hover:bg-surface min-h-[44px] flex items-center"
                                   onClick={() => setIsMobileMenuOpen(false)}
                              >
                                   Roadmap
                              </Link>
                              <Link
                                   href="/progress"
                                   className="block text-text-secondary hover:text-text-primary transition-colors py-3 px-2 rounded-lg hover:bg-surface min-h-[44px] flex items-center"
                                   onClick={() => setIsMobileMenuOpen(false)}
                              >
                                   Progress
                              </Link>
                              <div className="pt-4 border-t border-border space-y-2">
                                   <Link
                                        href="/login"
                                        className="block text-text-secondary hover:text-text-primary transition-colors py-3 px-2 rounded-lg hover:bg-surface min-h-[44px] flex items-center"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                   >
                                        Log In
                                   </Link>
                                   <Link
                                        href="/register"
                                        className="block bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors text-center min-h-[44px] flex items-center justify-center"
                                        onClick={() => setIsMobileMenuOpen(false)}
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
