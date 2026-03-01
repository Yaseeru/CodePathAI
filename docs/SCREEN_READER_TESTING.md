# Screen Reader Testing Guide

This guide provides instructions for testing the CodePath AI application with screen readers to ensure accessibility compliance.

## Supported Screen Readers

### Windows
- **NVDA** (NonVisual Desktop Access) - Free, open-source
  - Download: https://www.nvaccess.org/download/
  - Recommended for testing
- **JAWS** (Job Access With Speech) - Commercial
  - Most popular enterprise screen reader
  - Free demo available

### macOS
- **VoiceOver** - Built-in, free
  - Activate: Cmd + F5
  - Recommended for Mac testing

### Linux
- **Orca** - Free, open-source
  - Pre-installed on most distributions

### Mobile
- **TalkBack** (Android) - Built-in
- **VoiceOver** (iOS) - Built-in

## Quick Start

### NVDA (Windows)
1. Download and install NVDA
2. Launch NVDA (Ctrl + Alt + N)
3. Open browser and navigate to application
4. Use arrow keys to navigate
5. Press Insert + Down Arrow for "say all"

### VoiceOver (macOS)
1. Enable VoiceOver: Cmd + F5
2. Open browser and navigate to application
3. Use VO keys (Control + Option) + arrow keys
4. Press VO + A for "read all"

## Testing Checklist

### Navigation
- [ ] Skip link appears on first Tab press
- [ ] Skip link works (jumps to main content)
- [ ] All navigation links are announced correctly
- [ ] Current page is indicated
- [ ] Menu button announces expanded/collapsed state
- [ ] Mobile menu is accessible

### Forms
- [ ] All form fields have labels
- [ ] Labels are announced when field receives focus
- [ ] Required fields are indicated
- [ ] Error messages are announced
- [ ] Field validation errors are clear
- [ ] Success messages are announced
- [ ] Form submission feedback is provided

### Interactive Elements
- [ ] All buttons announce their purpose
- [ ] Links announce their destination
- [ ] Icon buttons have descriptive labels
- [ ] Toggle buttons announce their state
- [ ] Disabled elements are announced as disabled

### Content Structure
- [ ] Headings are in logical order (h1 → h2 → h3)
- [ ] No heading levels are skipped
- [ ] Landmarks are properly identified (main, nav, footer)
- [ ] Lists are announced as lists
- [ ] List items are counted correctly

### Images
- [ ] All images have alt text
- [ ] Alt text is descriptive and concise
- [ ] Decorative images are hidden (alt="")
- [ ] Complex images have detailed descriptions

### Dynamic Content
- [ ] Loading states are announced
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Chat messages are announced as they arrive
- [ ] Code execution results are announced
- [ ] Progress updates are announced

### Code Editor
- [ ] Editor is announced as editable text area
- [ ] Current language is announced
- [ ] Save/Run buttons are accessible
- [ ] Keyboard shortcuts are documented
- [ ] Code output is announced

### Chat Interface
- [ ] Chat region is identified
- [ ] Messages are announced as they arrive
- [ ] User vs AI messages are distinguished
- [ ] Message input is labeled
- [ ] Send button is accessible
- [ ] Character counter is announced

## Common Issues to Check

### Missing Labels
```tsx
// Bad
<button>
  <svg>...</svg>
</button>

// Good
<button aria-label="Save code">
  <svg aria-hidden="true">...</svg>
</button>
```

### Incorrect Heading Hierarchy
```tsx
// Bad
<h1>Page Title</h1>
<h3>Section</h3> {/* Skipped h2 */}

// Good
<h1>Page Title</h1>
<h2>Section</h2>
```

### Missing Form Labels
```tsx
// Bad
<input type="email" placeholder="Email" />

// Good
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="you@example.com" />
```

### Unlabeled Regions
```tsx
// Bad
<div className="chat">...</div>

// Good
<div role="region" aria-label="AI Mentor Chat">...</div>
```

## Testing Scenarios

### Scenario 1: New User Registration
1. Navigate to registration page
2. Verify all form fields are labeled
3. Fill out form using only keyboard
4. Submit form and verify feedback
5. Check error handling

**Expected Behavior:**
- All fields announced with labels
- Required fields indicated
- Validation errors announced
- Success message announced
- Redirect announced

### Scenario 2: Lesson Navigation
1. Navigate to roadmap
2. Select a lesson
3. Read lesson content
4. Complete exercises
5. Submit code

**Expected Behavior:**
- Lesson list announced
- Current lesson indicated
- Content structure clear
- Code editor accessible
- Submission feedback provided

### Scenario 3: AI Chat Interaction
1. Open chat interface
2. Send a message
3. Receive AI response
4. Continue conversation

**Expected Behavior:**
- Chat region identified
- Input field labeled
- Messages announced as they arrive
- User/AI distinction clear
- Loading state announced

### Scenario 4: Code Editing
1. Open code editor
2. Write code
3. Save code
4. Run code
5. Review output

**Expected Behavior:**
- Editor announced as editable
- Language announced
- Keyboard shortcuts work
- Save/Run actions announced
- Output announced

## NVDA Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Insert + Down Arrow | Say all (read from current position) |
| Down Arrow | Next line |
| Up Arrow | Previous line |
| Tab | Next focusable element |
| Shift + Tab | Previous focusable element |
| Insert + F7 | List all links |
| Insert + F6 | List all headings |
| Insert + F5 | List all form fields |
| Insert + Space | Focus mode (for forms) |
| Insert + T | Read window title |
| Insert + B | Read status bar |

## VoiceOver Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| VO + A | Read all |
| VO + Right Arrow | Next item |
| VO + Left Arrow | Previous item |
| VO + Space | Activate item |
| VO + U | Open rotor (navigation menu) |
| VO + H | Next heading |
| VO + Shift + H | Previous heading |
| VO + J | Next form control |
| VO + Shift + J | Previous form control |

Note: VO = Control + Option

## Testing Tools

### Browser Extensions
- **axe DevTools** - Automated accessibility testing
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Chrome DevTools accessibility audit

### Automated Testing
```bash
# Run accessibility tests
npm run test:a11y

# Run with specific screen reader simulation
npm run test:a11y -- --screen-reader=nvda
```

## Reporting Issues

When reporting screen reader issues, include:
1. Screen reader name and version
2. Browser name and version
3. Operating system
4. Steps to reproduce
5. Expected behavior
6. Actual behavior
7. Recording or transcript if possible

## Best Practices

### 1. Test with Real Screen Readers
- Automated tools catch ~30% of issues
- Manual testing is essential
- Test with multiple screen readers

### 2. Test Common User Flows
- Registration and login
- Navigation
- Form submission
- Content consumption
- Interactive features

### 3. Test with Keyboard Only
- Unplug mouse
- Navigate entire application
- Verify all features accessible

### 4. Test Dynamic Content
- Loading states
- Error messages
- Success notifications
- Real-time updates

### 5. Test on Multiple Platforms
- Windows (NVDA/JAWS)
- macOS (VoiceOver)
- Mobile (TalkBack/VoiceOver)

## Resources

- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Screen Reader Compatibility](https://www.powermapper.com/tests/screen-readers/)

## Continuous Testing

### During Development
- Test each new feature with screen reader
- Verify ARIA labels are correct
- Check dynamic content announcements

### Before Release
- Complete full application test
- Test all user flows
- Verify all issues resolved

### After Release
- Monitor user feedback
- Conduct periodic audits
- Update as needed
