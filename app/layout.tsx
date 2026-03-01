import type { Metadata, Viewport } from "next";
import "./globals.css";
import { initMonitoring } from "@/lib/monitoring/init";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Initialize monitoring services
initMonitoring();

export const metadata: Metadata = {
  title: "CodePath AI - Your Personal AI Coding Mentor",
  description: "Learn to code with personalized AI mentorship. Build real projects in focused 15-minute sessions tailored to your goals.",
  keywords: ["coding", "learning", "AI mentor", "programming", "education"],
  authors: [{ name: "CodePath AI" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
