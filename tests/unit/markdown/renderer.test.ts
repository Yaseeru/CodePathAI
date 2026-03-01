/**
 * Unit tests for markdown rendering
 */

import { describe, it, expect } from 'vitest';
import { renderMarkdownSync, markdownToPlainText, validateMarkdown } from '@/lib/markdown/renderer';

describe('Markdown Renderer', () => {
     describe('renderMarkdownSync', () => {
          it('should render headings correctly', () => {
               const markdown = '# Heading 1\n## Heading 2\n### Heading 3';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('<h1');
               expect(html).toContain('Heading 1');
               expect(html).toContain('<h2');
               expect(html).toContain('Heading 2');
               expect(html).toContain('<h3');
               expect(html).toContain('Heading 3');
          });

          it('should render lists correctly', () => {
               const markdown = '- Item 1\n- Item 2\n- Item 3';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('<ul');
               expect(html).toContain('<li');
               expect(html).toContain('Item 1');
               expect(html).toContain('Item 2');
               expect(html).toContain('Item 3');
          });

          it('should render ordered lists correctly', () => {
               const markdown = '1. First\n2. Second\n3. Third';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('<ol');
               expect(html).toContain('<li');
               expect(html).toContain('First');
               expect(html).toContain('Second');
               expect(html).toContain('Third');
          });

          it('should render emphasis correctly', () => {
               const markdown = '**bold** *italic* ~~strikethrough~~';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('<strong');
               expect(html).toContain('bold');
               expect(html).toContain('<em');
               expect(html).toContain('italic');
          });

          it('should render links with security attributes', () => {
               const markdown = '[Link text](https://example.com)';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('<a');
               expect(html).toContain('href="https://example.com"');
               expect(html).toContain('target="_blank"');
               expect(html).toContain('rel="noopener noreferrer"');
               expect(html).toContain('Link text');
          });

          it('should render code blocks with syntax highlighting', () => {
               const markdown = '```javascript\nconst x = 42;\n```';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('code-block');
               expect(html).toContain('javascript');
               expect(html).toContain('const');
               expect(html).toContain('42');
               expect(html).toContain('hljs');
          });

          it('should render inline code', () => {
               const markdown = 'Use `const` for constants';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('inline-code');
               expect(html).toContain('const');
          });

          it('should sanitize dangerous HTML', () => {
               const markdown = '<script>alert("xss")</script>';
               const html = renderMarkdownSync(markdown);

               expect(html).not.toContain('<script');
               expect(html).not.toContain('alert');
          });

          it('should sanitize dangerous attributes', () => {
               const markdown = '<a href="javascript:alert(1)">Click</a>';
               const html = renderMarkdownSync(markdown);

               expect(html).not.toContain('javascript:');
          });

          it('should handle empty input', () => {
               const html = renderMarkdownSync('');
               expect(html).toBe('');
          });

          it('should handle null/undefined input', () => {
               expect(renderMarkdownSync(null as any)).toBe('');
               expect(renderMarkdownSync(undefined as any)).toBe('');
          });

          it('should render blockquotes', () => {
               const markdown = '> This is a quote';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('<blockquote');
               expect(html).toContain('This is a quote');
          });

          it('should render horizontal rules', () => {
               const markdown = '---';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('<hr');
          });

          it('should render tables', () => {
               const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
               const html = renderMarkdownSync(markdown);

               expect(html).toContain('<table');
               expect(html).toContain('<thead');
               expect(html).toContain('<tbody');
               expect(html).toContain('<th');
               expect(html).toContain('<td');
               expect(html).toContain('Header 1');
               expect(html).toContain('Cell 1');
          });
     });

     describe('markdownToPlainText', () => {
          it('should extract plain text from markdown', () => {
               const markdown = '# Heading\n\nThis is **bold** text.';
               const text = markdownToPlainText(markdown);

               expect(text).toContain('Heading');
               expect(text).toContain('This is bold text');
               expect(text).not.toContain('#');
               expect(text).not.toContain('**');
          });

          it('should remove HTML tags', () => {
               const markdown = 'Text with <strong>HTML</strong>';
               const text = markdownToPlainText(markdown);

               expect(text).toContain('Text with HTML');
               expect(text).not.toContain('<strong>');
          });

          it('should handle empty input', () => {
               expect(markdownToPlainText('')).toBe('');
          });
     });

     describe('validateMarkdown', () => {
          it('should validate correct markdown', () => {
               const markdown = '# Heading\n\nParagraph text.';
               const result = validateMarkdown(markdown);

               expect(result.valid).toBe(true);
               expect(result.error).toBeUndefined();
          });

          it('should reject empty markdown', () => {
               const result = validateMarkdown('');

               expect(result.valid).toBe(false);
               expect(result.error).toBeDefined();
          });

          it('should reject null/undefined markdown', () => {
               expect(validateMarkdown(null as any).valid).toBe(false);
               expect(validateMarkdown(undefined as any).valid).toBe(false);
          });

          it('should reject markdown exceeding maximum length', () => {
               const longMarkdown = 'a'.repeat(100001);
               const result = validateMarkdown(longMarkdown);

               expect(result.valid).toBe(false);
               expect(result.error).toContain('maximum length');
          });

          it('should validate markdown with code blocks', () => {
               const markdown = '```javascript\nconst x = 42;\n```';
               const result = validateMarkdown(markdown);

               expect(result.valid).toBe(true);
          });

          it('should validate markdown with lists', () => {
               const markdown = '- Item 1\n- Item 2\n- Item 3';
               const result = validateMarkdown(markdown);

               expect(result.valid).toBe(true);
          });
     });
});
