import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware to handle authentication and onboarding-based routing
 * 
 * Routes:
 * - Public routes: /, /login, /register, /reset-password
 * - Onboarding route: /onboarding (requires auth, redirects if completed)
 * - Protected routes: All other routes (require auth + completed onboarding)
 */
export async function middleware(request: NextRequest) {
     const { pathname } = request.nextUrl;

     // Create a response object that we can modify
     let response = NextResponse.next({
          request: {
               headers: request.headers,
          },
     });

     // Create Supabase client for middleware
     const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
               cookies: {
                    get(name: string) {
                         return request.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                         request.cookies.set({
                              name,
                              value,
                              ...options,
                         });
                         response = NextResponse.next({
                              request: {
                                   headers: request.headers,
                              },
                         });
                         response.cookies.set({
                              name,
                              value,
                              ...options,
                         });
                    },
                    remove(name: string, options: any) {
                         request.cookies.set({
                              name,
                              value: '',
                              ...options,
                         });
                         response = NextResponse.next({
                              request: {
                                   headers: request.headers,
                              },
                         });
                         response.cookies.set({
                              name,
                              value: '',
                              ...options,
                         });
                    },
               },
          }
     );

     // Get the current user session
     const { data: { user } } = await supabase.auth.getUser();

     // Define route categories
     const publicRoutes = ['/', '/login', '/register', '/reset-password'];
     const authRoutes = ['/login', '/register', '/reset-password'];
     const onboardingRoute = '/onboarding';

     // Check if current path is public
     const isPublicRoute = publicRoutes.includes(pathname);
     const isAuthRoute = authRoutes.includes(pathname);
     const isOnboardingRoute = pathname === onboardingRoute;

     // If user is not authenticated
     if (!user) {
          // Allow access to public routes
          if (isPublicRoute) {
               return response;
          }

          // Redirect to login for protected routes
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(loginUrl);
     }

     // User is authenticated - check onboarding status
     const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

     const hasCompletedOnboarding = profile?.onboarding_completed ?? false;

     // If user is on auth routes (login/register) and authenticated, redirect to appropriate page
     if (isAuthRoute) {
          if (hasCompletedOnboarding) {
               return NextResponse.redirect(new URL('/dashboard', request.url));
          } else {
               return NextResponse.redirect(new URL('/onboarding', request.url));
          }
     }

     // If user hasn't completed onboarding
     if (!hasCompletedOnboarding) {
          // Allow access to onboarding route
          if (isOnboardingRoute) {
               return response;
          }

          // Redirect to onboarding for all other routes
          return NextResponse.redirect(new URL('/onboarding', request.url));
     }

     // User has completed onboarding
     // If they try to access onboarding, redirect to dashboard
     if (isOnboardingRoute) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
     }

     // Allow access to all other routes
     return response;
}

// Configure which routes the middleware should run on
export const config = {
     matcher: [
          /*
           * Match all request paths except:
           * - _next/static (static files)
           * - _next/image (image optimization files)
           * - favicon.ico (favicon file)
           * - public files (public folder)
           * - api routes (handled separately)
           */
          '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
     ],
};
