import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-b from-background to-surface py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto container-padding text-center">
          {/* Hero Section */}
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
              Learn to Code with Your
              <span className="block text-primary mt-3">Personal AI Mentor</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Build real projects in focused 15-minute sessions. Get personalized guidance
              tailored to your goals, not generic tutorials.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Learning Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-surface text-text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-border transition-all border border-border"
              >
                Log In
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 section-gap-mobile md:section-gap-tablet lg:section-gap-desktop mt-16 lg:mt-20" role="list">
              <div className="card-padding-mobile md:card-padding-tablet lg:card-padding-desktop bg-surface rounded-xl border border-border hover:shadow-md transition-all" role="listitem">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-3">
                  Goal-First Learning
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Start with what you want to build, not a programming language
                </p>
              </div>

              <div className="card-padding-mobile md:card-padding-tablet lg:card-padding-desktop bg-surface rounded-xl border border-border hover:shadow-md transition-all" role="listitem">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-3">
                  15-Minute Sessions
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Make progress even with a busy schedule
                </p>
              </div>

              <div className="card-padding-mobile md:card-padding-tablet lg:card-padding-desktop bg-surface rounded-xl border border-border hover:shadow-md transition-all" role="listitem">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-3">
                  Build Real Projects
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Create tangible outcomes aligned with your goals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
