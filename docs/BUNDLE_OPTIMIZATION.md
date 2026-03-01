# Bundle Optimization Guide

This document outlines the bundle optimization strategy for CodePath AI to ensure fast load times and optimal performance.

## Performance Targets

- **Initial Load**: < 3 seconds on 3G
- **First Contentful Paint (FCP)**: < 1.8 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Time to Interactive (TTI)**: < 3.5 seconds
- **Total Bundle Size**: < 500KB (gzipped)
- **JavaScript Bundle**: < 300KB (gzipped)
- **CSS Bundle**: < 50KB (gzipped)

## Current Bundle Analysis

### Run Bundle Analysis

```bash
# Build with bundle analysis
npm run build

# Analyze bundle size
npx @next/bundle-analyzer

# Check bundle composition
du -sh .next/static/chunks/*
```

### Key Metrics to Track

1. **First Load JS**: JavaScript loaded on initial page load
2. **Route Bundles**: JavaScript per route
3. **Shared Chunks**: Code shared across routes
4. **Vendor Bundles**: Third-party dependencies

## Optimization Strategies

### 1. Code Splitting

#### Dynamic Imports

Split large components that aren't needed immediately:

```typescript
// Before: Static import
import { CodeEditor } from '@/components/editor/CodeEditor';

// After: Dynamic import
import dynamic from 'next/dynamic';

const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false // Monaco Editor doesn't work with SSR
});
```

**Components to Split**:
- Monaco Editor (large, not needed on all pages)
- Chart libraries (if used)
- Markdown renderer (only needed for lesson content)
- AI chat interface (only needed on specific pages)

#### Route-Based Splitting

Next.js automatically splits by route. Verify with:

```bash
# Check route bundles
ls -lh .next/static/chunks/pages/
```

### 2. Tree Shaking

#### Import Only What You Need

```typescript
// Bad: Imports entire library
import _ from 'lodash';
const result = _.debounce(fn, 300);

// Good: Import specific function
import debounce from 'lodash/debounce';
const result = debounce(fn, 300);

// Better: Use native alternatives
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};
```

#### Analyze Unused Code

```bash
# Find unused exports
npx ts-prune

# Find unused dependencies
npx depcheck
```

### 3. Dependency Optimization

#### Audit Dependencies

```bash
# List all dependencies with sizes
npm list --depth=0

# Analyze dependency sizes
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

#### Replace Heavy Dependencies

**Current Dependencies to Review**:

1. **Monaco Editor** (~2MB)
   - Already using dynamic import
   - Consider lazy loading language support
   - Only load needed languages

2. **Marked** (Markdown parser)
   - Consider lighter alternative (markdown-it)
   - Or use Next.js built-in MDX

3. **DOMPurify** (HTML sanitization)
   - Necessary for security
   - Already optimized

4. **Highlight.js** (Syntax highlighting)
   - Only import needed languages
   - Consider Prism.js as lighter alternative

#### Optimize Monaco Editor

```typescript
// Only load needed languages
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// Import only JavaScript, Python, HTML
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution';

// Don't import all languages
// import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
```

### 4. Image Optimization

#### Use Next.js Image Component

```typescript
import Image from 'next/image';

// Automatic optimization, lazy loading, responsive images
<Image
  src="/lesson-diagram.png"
  alt="Lesson diagram"
  width={800}
  height={600}
  priority={false} // Lazy load by default
  placeholder="blur"
  quality={85} // Reduce quality slightly for smaller size
/>
```

#### Image Formats

- Use WebP for photos
- Use SVG for icons and logos
- Use PNG only when transparency needed
- Compress all images before upload

#### Image CDN

Vercel automatically serves images via CDN with optimization.

### 5. Font Optimization

#### Use Next.js Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  variable: '--font-inter'
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

#### Font Subsetting

Only load character sets you need:

```typescript
const inter = Inter({
  subsets: ['latin'], // Don't load cyrillic, greek, etc.
  weight: ['400', '500', '600', '700'], // Only needed weights
  display: 'swap'
});
```

### 6. CSS Optimization

#### Tailwind CSS Purging

Tailwind automatically purges unused CSS in production. Verify configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};
```

#### Critical CSS

Next.js automatically inlines critical CSS. Verify by checking page source.

#### CSS Modules

Use CSS Modules for component-specific styles to enable automatic code splitting:

```typescript
// Component.module.css
.button {
  /* styles */
}

// Component.tsx
import styles from './Component.module.css';
```

### 7. JavaScript Optimization

#### Minification

Next.js automatically minifies JavaScript in production using SWC.

#### Compression

Vercel automatically serves gzipped and Brotli-compressed assets.

#### Remove Console Logs

```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false
  }
};
```

### 8. Third-Party Scripts

#### Optimize Analytics

```typescript
// Use Next.js Script component with strategy
import Script from 'next/script';

<Script
  src="https://www.googletagmanager.com/gtag/js"
  strategy="afterInteractive" // Load after page is interactive
/>
```

#### Defer Non-Critical Scripts

```typescript
<Script
  src="/analytics.js"
  strategy="lazyOnload" // Load when browser is idle
/>
```

### 9. API Route Optimization

#### Edge Runtime

Use Edge Runtime for faster API responses:

```typescript
// app/api/health/route.ts
export const runtime = 'edge';

export async function GET() {
  return Response.json({ status: 'ok' });
}
```

#### Response Caching

```typescript
export async function GET() {
  return Response.json(
    { data: 'cached data' },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    }
  );
}
```

### 10. Build Configuration

#### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  // Enable SWC minification (default in Next.js 13+)
  swcMinify: true,
  
  // Optimize images
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ['@monaco-editor/react', 'lucide-react'],
  },
};

export default nextConfig;
```

## Optimization Checklist

### Pre-Build

- [ ] Run dependency audit: `npm audit`
- [ ] Check for unused dependencies: `npx depcheck`
- [ ] Review large dependencies
- [ ] Optimize images
- [ ] Remove unused code

### Build

- [ ] Run production build: `npm run build`
- [ ] Check build output for warnings
- [ ] Analyze bundle sizes
- [ ] Verify code splitting
- [ ] Check for duplicate dependencies

### Post-Build

- [ ] Test production build locally
- [ ] Run Lighthouse audit
- [ ] Check Web Vitals
- [ ] Verify lazy loading
- [ ] Test on slow network (3G)

## Bundle Size Targets

### By Route

| Route | First Load JS | Target |
|-------|--------------|--------|
| / (Homepage) | < 150KB | ✅ |
| /login | < 100KB | ✅ |
| /dashboard | < 200KB | ✅ |
| /lesson/[id] | < 250KB | ⚠️ (Monaco Editor) |
| /roadmap | < 150KB | ✅ |

### By Component

| Component | Size | Target |
|-----------|------|--------|
| Monaco Editor | ~2MB | Lazy loaded |
| Chat Interface | < 50KB | ✅ |
| Code Output | < 20KB | ✅ |
| Roadmap View | < 30KB | ✅ |

## Monitoring

### Build Size Tracking

Track bundle sizes over time:

```bash
# In CI/CD pipeline
npm run build
du -sh .next/static/chunks/* > bundle-sizes.txt
git diff bundle-sizes.txt
```

### Performance Monitoring

- Vercel Analytics: Automatic Web Vitals tracking
- Lighthouse CI: Automated performance audits
- Real User Monitoring: PostHog or similar

### Alerts

Set up alerts for:
- Bundle size increase > 10%
- LCP > 2.5s
- FCP > 1.8s
- TTI > 3.5s

## Testing

### Local Testing

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Test with slow network
# Chrome DevTools > Network > Slow 3G
```

### Lighthouse Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://localhost:3000 --view

# Target scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 95
# SEO: > 90
```

### Bundle Analysis

```bash
# Analyze bundle
npx @next/bundle-analyzer

# Check for:
# - Duplicate dependencies
# - Large dependencies
# - Unused code
# - Inefficient imports
```

## Common Issues and Solutions

### Issue: Large Monaco Editor Bundle

**Solution**: 
- Use dynamic import with `ssr: false`
- Only load needed languages
- Consider code editor alternatives for simple use cases

### Issue: Duplicate Dependencies

**Solution**:
```bash
# Find duplicates
npm ls <package-name>

# Deduplicate
npm dedupe

# Or use resolutions in package.json
"resolutions": {
  "package-name": "1.0.0"
}
```

### Issue: Large CSS Bundle

**Solution**:
- Verify Tailwind purging is working
- Remove unused CSS
- Use CSS Modules for component styles
- Avoid importing entire CSS frameworks

### Issue: Slow Initial Load

**Solution**:
- Implement code splitting
- Lazy load non-critical components
- Optimize images
- Use CDN for static assets
- Enable compression

## Continuous Optimization

### Weekly

- [ ] Review bundle size reports
- [ ] Check for new large dependencies
- [ ] Monitor Web Vitals

### Monthly

- [ ] Run full Lighthouse audit
- [ ] Review and update dependencies
- [ ] Analyze user performance data
- [ ] Optimize slow pages

### Quarterly

- [ ] Comprehensive performance review
- [ ] Update optimization strategies
- [ ] Review new Next.js features
- [ ] Benchmark against competitors

## Resources

- [Next.js Bundle Analysis](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
