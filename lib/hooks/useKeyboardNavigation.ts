/**
 * Keyboard Navigation Hook
 * Provides utilities for implementing keyboard navigation across the application
 */

import { useEffect, useCallback, RefObject } from 'react';

export interface KeyboardShortcut {
     key: string;
     ctrlKey?: boolean;
     shiftKey?: boolean;
     altKey?: boolean;
     metaKey?: boolean;
     description: string;
     action: () => void;
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
     useEffect(() => {
          if (!enabled) return;

          const handleKeyDown = (event: KeyboardEvent) => {
               for (const shortcut of shortcuts) {
                    const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey;
                    const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey;
                    const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey;
                    const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey;
                    const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();

                    if (ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch) {
                         event.preventDefault();
                         shortcut.action();
                         break;
                    }
               }
          };

          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
     }, [shortcuts, enabled]);
}

/**
 * Hook to trap focus within a container (useful for modals and dialogs)
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement>, enabled = true) {
     useEffect(() => {
          if (!enabled || !containerRef.current) return;

          const container = containerRef.current;
          const focusableElements = container.querySelectorAll<HTMLElement>(
               'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          const handleKeyDown = (event: KeyboardEvent) => {
               if (event.key !== 'Tab') return;

               if (event.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                         event.preventDefault();
                         lastElement?.focus();
                    }
               } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                         event.preventDefault();
                         firstElement?.focus();
                    }
               }
          };

          container.addEventListener('keydown', handleKeyDown);

          // Focus first element when trap is enabled
          firstElement?.focus();

          return () => container.removeEventListener('keydown', handleKeyDown);
     }, [containerRef, enabled]);
}

/**
 * Hook to handle Escape key for closing modals/dialogs
 */
export function useEscapeKey(callback: () => void, enabled = true) {
     useEffect(() => {
          if (!enabled) return;

          const handleKeyDown = (event: KeyboardEvent) => {
               if (event.key === 'Escape') {
                    callback();
               }
          };

          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
     }, [callback, enabled]);
}

/**
 * Hook to manage roving tabindex for keyboard navigation in lists
 */
export function useRovingTabIndex(
     containerRef: RefObject<HTMLElement>,
     itemSelector: string,
     enabled = true
) {
     const handleKeyDown = useCallback((event: KeyboardEvent) => {
          if (!containerRef.current) return;

          const items = Array.from(
               containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
          );
          const currentIndex = items.findIndex(item => item === document.activeElement);

          if (currentIndex === -1) return;

          let nextIndex = currentIndex;

          switch (event.key) {
               case 'ArrowDown':
               case 'ArrowRight':
                    event.preventDefault();
                    nextIndex = (currentIndex + 1) % items.length;
                    break;
               case 'ArrowUp':
               case 'ArrowLeft':
                    event.preventDefault();
                    nextIndex = (currentIndex - 1 + items.length) % items.length;
                    break;
               case 'Home':
                    event.preventDefault();
                    nextIndex = 0;
                    break;
               case 'End':
                    event.preventDefault();
                    nextIndex = items.length - 1;
                    break;
               default:
                    return;
          }

          items[nextIndex]?.focus();
     }, [containerRef, itemSelector]);

     useEffect(() => {
          if (!enabled || !containerRef.current) return;

          const container = containerRef.current;
          container.addEventListener('keydown', handleKeyDown);

          return () => container.removeEventListener('keydown', handleKeyDown);
     }, [containerRef, handleKeyDown, enabled]);
}

/**
 * Utility to get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
     return Array.from(
          container.querySelectorAll<HTMLElement>(
               'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
     );
}

/**
 * Utility to restore focus to a previously focused element
 */
export function useFocusReturn(enabled = true) {
     useEffect(() => {
          if (!enabled) return;

          const previouslyFocused = document.activeElement as HTMLElement;

          return () => {
               previouslyFocused?.focus();
          };
     }, [enabled]);
}
