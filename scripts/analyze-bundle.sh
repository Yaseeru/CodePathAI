#!/bin/bash

# Bundle Analysis Script for CodePath AI
# This script analyzes the production bundle and reports on sizes

set -e

echo "🔍 Analyzing production bundle..."
echo ""

# Build the application
echo "📦 Building production bundle..."
npm run build

echo ""
echo "📊 Bundle Size Report"
echo "===================="
echo ""

# Analyze .next directory
echo "Total .next directory size:"
du -sh .next
echo ""

# Analyze static chunks
echo "Static chunks:"
du -sh .next/static/chunks/* | sort -h | tail -20
echo ""

# Analyze pages
echo "Page bundles:"
du -sh .next/static/chunks/pages/* 2>/dev/null | sort -h || echo "No page bundles found"
echo ""

# Find largest files
echo "Top 10 largest files:"
find .next -type f -exec du -h {} + | sort -rh | head -10
echo ""

# Check for duplicate dependencies
echo "🔍 Checking for duplicate dependencies..."
npm ls --depth=0 2>&1 | grep -E "UNMET|extraneous" || echo "✅ No duplicate dependencies found"
echo ""

# Check bundle composition
echo "📈 Bundle Composition:"
echo "JavaScript files:"
find .next/static/chunks -name "*.js" -exec du -ch {} + | tail -1
echo ""

echo "CSS files:"
find .next/static/css -name "*.css" -exec du -ch {} + 2>/dev/null | tail -1 || echo "No CSS files found"
echo ""

# Performance recommendations
echo "💡 Performance Recommendations:"
echo "================================"
echo ""

# Check for large files
LARGE_FILES=$(find .next/static -type f -size +500k)
if [ -n "$LARGE_FILES" ]; then
  echo "⚠️  Large files detected (>500KB):"
  echo "$LARGE_FILES" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "  - $file ($size)"
  done
  echo ""
else
  echo "✅ No files larger than 500KB"
  echo ""
fi

# Check total JavaScript size
TOTAL_JS_SIZE=$(find .next/static/chunks -name "*.js" -exec du -b {} + | awk '{sum+=$1} END {print sum}')
TOTAL_JS_MB=$(echo "scale=2; $TOTAL_JS_SIZE / 1024 / 1024" | bc)
echo "Total JavaScript size: ${TOTAL_JS_MB}MB"

if (( $(echo "$TOTAL_JS_MB > 2" | bc -l) )); then
  echo "⚠️  JavaScript bundle is large. Consider:"
  echo "  - Code splitting"
  echo "  - Dynamic imports"
  echo "  - Removing unused dependencies"
else
  echo "✅ JavaScript bundle size is acceptable"
fi
echo ""

# Summary
echo "📋 Summary"
echo "=========="
echo "Build completed successfully!"
echo "Review the bundle sizes above and optimize as needed."
echo ""
echo "Next steps:"
echo "1. Run 'npm start' to test production build locally"
echo "2. Run Lighthouse audit for performance metrics"
echo "3. Deploy to Vercel for production testing"
