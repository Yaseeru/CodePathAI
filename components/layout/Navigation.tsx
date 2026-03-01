"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

     return (
          <nav className="bg-surface border-b border-border">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                         {/* Logo */}
                         <div className="flex items-center">
                              <Link href="/" className="flex items-center space-x-2">
                                   <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">C</span>
                                   </div>
                                   <span className="text-xl font-bold text-text-primary">
                                        CodePath AI
                                   </span>
                              </Link>
                         </div>

                         {/* Desktop Navigation */}
                         <div className="hidden md:flex items-center space-x-8">
                              <Link
                                   href="/dashboard"
                                   className="text-text-secondary hover:text-text-primary transition-colors"
                              >
                                   Dashboard
                              </Link>
                              <Link
                                   href="/roadmap"
                                   className="text-text-secondary hover:text-text-primary transition-colors"
                              >
                                   Roadmap
                              </Link>
                              <Link
                                   href="/progress"
                                   className="text-text-secondary hover:text-text-primary transition-colors"
                              >
                                   Progress
                              </Link>
                         </div>

                         {/* Desktop Auth Buttons */}
                         <div className="hidden md:flex items-center space-x-4">
                              <Link
                                   href="/login"
                                   className="text-text-secondary hover:text-text-primary transition-colors"
                              >
                                   Log In
                              </Link>
                              <Link
                                   href="/register"
                                   className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                              >
                                   Get Started
                              </Link>
                         </div>

                         {/* Mobile Menu Button */}
                         <button
                              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                              aria-label="Toggle menu"
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

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                         <div className="md:hidden py-4 space-y-4">
                              <Link
                                   href="/dashboard"
                                   className="block text-text-secondary hover:text-text-primary transition-colors"
                                   onClick={() => setIsMobileMenuOpen(false)}
                              >
                                   Dashboard
                              </Link>
                              <Link
                                   href="/roadmap"
                                   className="block text-text-secondary hover:text-text-primary transition-colors"
                                   onClick={() => setIsMobileMenuOpen(false)}
                              >
                                   Roadmap
                              </Link>
                              <Link
                                   href="/progress"
                                   className="block text-text-secondary hover:text-text-primary transition-colors"
                                   onClick={() => setIsMobileMenuOpen(false)}
                              >
                                   Progress
                              </Link>
                              <div className="pt-4 border-t border-border space-y-4">
                                   <Link
                                        href="/login"
                                        className="block text-text-secondary hover:text-text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                   >
                                        Log In
                                   </Link>
                                   <Link
                                        href="/register"
                                        className="block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-center"
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
