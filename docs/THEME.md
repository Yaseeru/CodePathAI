# CodePath AI Design System

## Color Palette

### Brand Colors
- **Primary (Indigo)**: `#6366f1` - Main brand color for CTAs, links, and primary actions
  - Dark: `#4f46e5`
  - Light: `#818cf8`
- **Secondary (Green)**: `#10b981` - Success states, progress indicators
  - Dark: `#059669`
  - Light: `#34d399`
- **Accent (Amber)**: `#f59e0b` - Highlights, warnings, attention-grabbing elements
  - Dark: `#d97706`
  - Light: `#fbbf24`

### Neutral Colors
- **Background**: `#ffffff` (light) / `#0f172a` (dark)
- **Surface**: `#f9fafb` (light) / `#1e293b` (dark)
- **Border**: `#e5e7eb` (light) / `#334155` (dark)

### Text Colors
- **Primary**: `#111827` (light) / `#f1f5f9` (dark)
- **Secondary**: `#6b7280` (light) / `#cbd5e1` (dark)
- **Tertiary**: `#9ca3af` (light) / `#94a3b8` (dark)

### Semantic Colors
- **Success**: `#10b981`
- **Error**: `#ef4444`
- **Warning**: `#f59e0b`
- **Info**: `#3b82f6`

### Code Editor Colors
- **Background**: `#1e293b` (light) / `#0f172a` (dark)
- **Text**: `#e2e8f0`

## Typography

### Font Families
- **Sans**: System font stack (Segoe UI, Roboto, etc.)
- **Mono**: Monaco, Consolas, Courier New

### Font Sizes
- **xs**: 12px (0.75rem)
- **sm**: 14px (0.875rem)
- **base**: 16px (1rem)
- **lg**: 18px (1.125rem)
- **xl**: 20px (1.25rem)
- **2xl**: 24px (1.5rem)
- **3xl**: 30px (1.875rem)
- **4xl**: 36px (2.25rem)

## Spacing Scale

- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)

## Border Radius

- **sm**: 4px (0.25rem)
- **md**: 8px (0.5rem)
- **lg**: 12px (0.75rem)
- **xl**: 16px (1rem)

## Shadows

- **sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1)`
- **xl**: `0 20px 25px -5px rgb(0 0 0 / 0.1)`

## Usage with Tailwind

All custom colors are available as Tailwind utilities:

```tsx
// Brand colors
<div className="bg-primary text-white">Primary Button</div>
<div className="bg-secondary">Success State</div>
<div className="bg-accent">Warning Badge</div>

// Text colors
<p className="text-text-primary">Main heading</p>
<p className="text-text-secondary">Subheading</p>
<p className="text-text-tertiary">Caption</p>

// Backgrounds
<div className="bg-background">Page background</div>
<div className="bg-surface">Card background</div>

// Borders
<div className="border border-border">Card with border</div>
```

## Responsive Design

### Breakpoints
- **sm**: 640px (mobile landscape)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)
- **2xl**: 1536px (extra large desktop)

### Target Devices
- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## Accessibility

### Color Contrast
All text/background combinations meet WCAG AA standards (4.5:1 minimum contrast ratio).

### Focus States
All interactive elements have visible focus indicators using the primary color with 2px outline and 2px offset.

### Font Sizes
- Minimum body text: 14px
- Maximum body text: 18px
- Base font size: 16px

## Dark Mode

The theme automatically adapts to user's system preference using `prefers-color-scheme` media query. All colors have dark mode variants defined in CSS variables.
