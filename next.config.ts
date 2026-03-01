import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Image optimization configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Production optimizations
  compiler: {
    // Remove console logs in production (keep error and warn)
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Experimental optimizations
  experimental: {
    // Optimize CSS
    optimizeCss: true,

    // Optimize package imports
    optimizePackageImports: [
      '@monaco-editor/react',
      'lucide-react',
      'react-icons',
    ],
  },

  // Production source maps (for error tracking)
  productionBrowserSourceMaps: true,
};

export default nextConfig;
