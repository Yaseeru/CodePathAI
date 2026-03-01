# Alt Text Guidelines

This document provides guidelines for writing effective alt text for images in the CodePath AI application.

## What is Alt Text?

Alt text (alternative text) is a written description of an image that:
- Appears in place of an image if it fails to load
- Is read aloud by screen readers for visually impaired users
- Helps search engines understand image content
- Provides context when images are disabled

## WCAG Requirements

According to WCAG 2.1 Level AA (Requirement 20.5):
- All non-text content must have a text alternative
- Alt text should convey the same information as the image
- Decorative images should have empty alt text (`alt=""`)

## Writing Good Alt Text

### DO:
✅ Be specific and concise (aim for < 125 characters)
✅ Describe the content and function of the image
✅ Include relevant context
✅ Use proper punctuation
✅ Convey the same information as the image
✅ Use empty alt (`alt=""`) for decorative images

### DON'T:
❌ Start with "image of" or "picture of" (screen readers announce it's an image)
❌ Include redundant information already in surrounding text
❌ Use generic descriptions like "graphic" or "icon"
❌ Omit alt attribute entirely
❌ Use filename as alt text
❌ Describe decorative images

## Examples

### Good Alt Text

```tsx
// Informative image
<img src="/user-avatar.jpg" alt="John Doe profile picture" />

// Functional image (button)
<button>
  <img src="/save-icon.svg" alt="Save" />
</button>

// Complex image (chart)
<img 
  src="/progress-chart.png" 
  alt="Bar chart showing 75% lesson completion, 3 projects completed, and 15-day learning streak" 
/>

// Logo with text
<img src="/logo.svg" alt="CodePath AI" />

// Decorative image
<img src="/background-pattern.svg" alt="" />
```

### Bad Alt Text

```tsx
// Too generic
<img src="/user.jpg" alt="image" />

// Redundant
<p>John Doe</p>
<img src="/user.jpg" alt="John Doe" />

// Filename
<img src="/IMG_1234.jpg" alt="IMG_1234.jpg" />

// Missing alt
<img src="/icon.svg" />

// Describing decorative image
<img src="/decorative-line.svg" alt="A decorative horizontal line" />
```

## Image Categories

### 1. Informative Images
Images that convey information or concepts.

**Examples:**
- User avatars
- Lesson thumbnails
- Project screenshots
- Diagrams

**Alt Text Pattern:**
- Describe what the image shows
- Include relevant details
- Keep it concise

```tsx
<img src="/lesson-thumbnail.jpg" alt="JavaScript functions lesson thumbnail" />
```

### 2. Functional Images
Images used as buttons or links.

**Examples:**
- Icon buttons
- Logo links
- Navigation icons

**Alt Text Pattern:**
- Describe the action, not the image
- Use verb phrases
- Match button/link text if present

```tsx
<button>
  <img src="/play-icon.svg" alt="Run code" />
</button>

<Link href="/">
  <img src="/logo.svg" alt="CodePath AI home" />
</Link>
```

### 3. Decorative Images
Images that don't add information (purely visual).

**Examples:**
- Background patterns
- Decorative borders
- Spacer images
- Purely aesthetic graphics

**Alt Text Pattern:**
- Use empty alt: `alt=""`
- Never omit alt attribute
- Mark as `aria-hidden="true"` for extra clarity

```tsx
<img src="/decorative-pattern.svg" alt="" aria-hidden="true" />
```

### 4. Complex Images
Images with detailed information (charts, graphs, diagrams).

**Examples:**
- Progress charts
- Roadmap visualizations
- Code flow diagrams

**Alt Text Pattern:**
- Provide brief description in alt
- Include detailed description nearby or in `aria-describedby`
- Consider providing data table alternative

```tsx
<figure>
  <img 
    src="/progress-chart.png" 
    alt="Weekly progress chart" 
    aria-describedby="chart-description"
  />
  <figcaption id="chart-description">
    Bar chart showing daily lesson completions for the past week: 
    Monday: 2 lessons, Tuesday: 3 lessons, Wednesday: 1 lesson, 
    Thursday: 2 lessons, Friday: 4 lessons, Saturday: 1 lesson, Sunday: 2 lessons.
  </figcaption>
</figure>
```

### 5. Text Images
Images containing text (avoid when possible).

**Examples:**
- Logos with text
- Badges
- Certificates

**Alt Text Pattern:**
- Include all text from the image
- Add context if needed

```tsx
<img src="/badge.png" alt="Completed 10 lessons badge" />
```

## Context Matters

Alt text should consider the context where the image appears.

### Example: User Avatar

**In profile page:**
```tsx
<img src="/avatar.jpg" alt="Profile picture" />
```

**In comment thread:**
```tsx
<img src="/avatar.jpg" alt="John Doe" />
```

**In user list:**
```tsx
<img src="/avatar.jpg" alt="" />
<!-- Name is already in adjacent text -->
<span>John Doe</span>
```

## SVG Icons

For inline SVG icons, use `aria-label` or `aria-labelledby`:

```tsx
// Decorative icon
<svg aria-hidden="true">
  <path d="..." />
</svg>

// Functional icon
<button aria-label="Close menu">
  <svg aria-hidden="true">
    <path d="..." />
  </svg>
</button>

// Icon with label
<svg role="img" aria-labelledby="icon-title">
  <title id="icon-title">Settings</title>
  <path d="..." />
</svg>
```

## Next.js Image Component

When using Next.js `<Image>` component, always include alt:

```tsx
import Image from 'next/image';

// Good
<Image 
  src="/lesson.jpg" 
  alt="Introduction to JavaScript lesson" 
  width={800} 
  height={600} 
/>

// Decorative
<Image 
  src="/pattern.svg" 
  alt="" 
  width={100} 
  height={100}
  aria-hidden="true"
/>
```

## Testing Alt Text

### Manual Testing
1. Turn off images in browser
2. Use screen reader (NVDA, JAWS, VoiceOver)
3. Check if page makes sense without images

### Automated Testing
- Use axe DevTools
- Run Lighthouse accessibility audit
- Check for missing alt attributes

### Questions to Ask
- Does the alt text convey the same information as the image?
- Would a user understand the page without seeing the image?
- Is the alt text concise and clear?
- Are decorative images properly marked?

## Common Mistakes to Avoid

1. **Missing Alt Attribute**
   ```tsx
   // Wrong
   <img src="/icon.svg" />
   
   // Right
   <img src="/icon.svg" alt="Settings" />
   ```

2. **Redundant Alt Text**
   ```tsx
   // Wrong
   <button>
     Save
     <img src="/save.svg" alt="Save" />
   </button>
   
   // Right
   <button>
     Save
     <img src="/save.svg" alt="" />
   </button>
   ```

3. **Describing Decorative Images**
   ```tsx
   // Wrong
   <img src="/divider.svg" alt="Decorative line divider" />
   
   // Right
   <img src="/divider.svg" alt="" />
   ```

4. **Using Filename**
   ```tsx
   // Wrong
   <img src="/IMG_1234.jpg" alt="IMG_1234.jpg" />
   
   // Right
   <img src="/IMG_1234.jpg" alt="Student working on laptop" />
   ```

## Checklist

Before deploying, verify:
- [ ] All images have alt attribute
- [ ] Informative images have descriptive alt text
- [ ] Functional images describe the action
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images have detailed descriptions
- [ ] Alt text is concise (< 125 characters when possible)
- [ ] No redundant "image of" or "picture of" phrases
- [ ] Context is considered for each image
- [ ] SVG icons are properly labeled or hidden
- [ ] Tested with screen reader

## Resources

- [WebAIM: Alternative Text](https://webaim.org/techniques/alttext/)
- [W3C: Alt Text Decision Tree](https://www.w3.org/WAI/tutorials/images/decision-tree/)
- [WCAG 2.1: Text Alternatives](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)
