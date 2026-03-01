/**
 * Markdown Rendering Utilities
 * Integrates marked with syntax highlighting and HTML sanitization
 */

import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Configure marked with custom renderer for syntax highlighting
 */
const renderer = new marked.Renderer();

// Override code block rendering to add syntax highlighting
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
     const validLanguage = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
     const highlighted = hljs.highlight(text, { language: validLanguage }).value;

     return `
          <div class="code-block">
               <div class="code-header">
                    <span class="code-language">${validLanguage}</span>
               </div>
               <pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>
          </div>
     `;
};

// Override inline code rendering
renderer.codespan = function ({ text }: { text: string }) {
     return `<code class="inline-code">${text}</code>`;
};

// Override link rendering to add security attributes
renderer.link = function ({ href, title, text }: { href: string; title?: string; text: string }) {
     const titleAttr = title ? ` title="${title}"` : '';
     return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

// Configure marked options
marked.setOptions({
     renderer: renderer,
     gfm: true, // GitHub Flavored Markdown
     breaks: true, // Convert \n to <br>
     pedantic: false,
     silent: false,
});

/**
 * Sanitization configuration for DOMPurify
 */
const sanitizeConfig = {
     ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'hr',
          'strong', 'em', 'u', 's', 'del', 'ins',
          'ul', 'ol', 'li',
          'blockquote', 'pre', 'code',
          'a', 'img',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span',
     ],
     ALLOWED_ATTR: [
          'href', 'title', 'target', 'rel',
          'src', 'alt', 'width', 'height',
          'class', 'id',
     ],
     ALLOW_DATA_ATTR: false,
     ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Renders markdown to HTML with syntax highlighting and sanitization
 * 
 * @param markdown - The markdown string to render
 * @returns Sanitized HTML string
 */
export async function renderMarkdown(markdown: string): Promise<string> {
     if (!markdown || typeof markdown !== 'string') {
          return '';
     }

     try {
          // Parse markdown to HTML
          const html = await marked.parse(markdown);

          // Sanitize HTML output
          const sanitized = DOMPurify.sanitize(html, sanitizeConfig);

          return sanitized;
     } catch (error) {
          console.error('Error rendering markdown:', error);
          return '';
     }
}

/**
 * Renders markdown synchronously (for server-side rendering)
 * 
 * @param markdown - The markdown string to render
 * @returns Sanitized HTML string
 */
export function renderMarkdownSync(markdown: string): string {
     if (!markdown || typeof markdown !== 'string') {
          return '';
     }

     try {
          // Parse markdown to HTML (synchronous)
          const html = marked.parse(markdown) as string;

          // Sanitize HTML output
          const sanitized = DOMPurify.sanitize(html, sanitizeConfig);

          return sanitized;
     } catch (error) {
          console.error('Error rendering markdown:', error);
          return '';
     }
}

/**
 * Extracts plain text from markdown (strips all formatting)
 * 
 * @param markdown - The markdown string
 * @returns Plain text string
 */
export function markdownToPlainText(markdown: string): string {
     if (!markdown || typeof markdown !== 'string') {
          return '';
     }

     try {
          const html = marked.parse(markdown) as string;
          const text = html.replace(/<[^>]*>/g, ''); // Strip HTML tags
          return text.trim();
     } catch (error) {
          console.error('Error converting markdown to plain text:', error);
          return '';
     }
}

/**
 * Validates that markdown content is safe and well-formed
 * 
 * @param markdown - The markdown string to validate
 * @returns Validation result
 */
export function validateMarkdown(markdown: string): { valid: boolean; error?: string } {
     if (!markdown || typeof markdown !== 'string') {
          return { valid: false, error: 'Markdown content is required' };
     }

     if (markdown.length > 100000) {
          return { valid: false, error: 'Markdown content exceeds maximum length (100KB)' };
     }

     try {
          // Try to parse the markdown
          marked.parse(markdown);
          return { valid: true };
     } catch (error) {
          return { valid: false, error: `Invalid markdown: ${error}` };
     }
}

/**
 * Supported markdown features:
 * - Headings (h1-h6)
 * - Lists (ordered and unordered)
 * - Emphasis (bold, italic, strikethrough)
 * - Links (with security attributes)
 * - Code blocks (with syntax highlighting)
 * - Inline code
 * - Blockquotes
 * - Tables
 * - Horizontal rules
 * - Line breaks
 */
