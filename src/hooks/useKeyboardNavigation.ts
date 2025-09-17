// src/hooks/useKeyboardNavigation.ts

/**
 * Custom hook for keyboard navigation and focus management
 */

import { useCallback, useEffect, useRef } from 'react';

export interface UseKeyboardNavigationOptions {
  /**
   * Whether keyboard navigation is enabled
   */
  enabled?: boolean;

  /**
   * Direction of navigation ('horizontal' | 'vertical' | 'both')
   */
  direction?: 'horizontal' | 'vertical' | 'both';

  /**
   * Whether to loop navigation (wrap around at ends)
   */
  loop?: boolean;

  /**
   * Callback when Enter key is pressed
   */
  onEnter?: (element: HTMLElement) => void;

  /**
   * Callback when Space key is pressed
   */
  onSpace?: (element: HTMLElement) => void;

  /**
   * Callback when Escape key is pressed
   */
  onEscape?: () => void;

  /**
   * Callback when an arrow key is pressed
   */
  onArrowKey?: (
    direction: 'up' | 'down' | 'left' | 'right',
    element: HTMLElement
  ) => void;
}

export interface UseKeyboardNavigationReturn {
  /**
   * Ref to attach to the container element
   */
  containerRef: React.RefObject<HTMLElement>;

  /**
   * Function to focus the first focusable element
   */
  focusFirst: () => void;

  /**
   * Function to focus the last focusable element
   */
  focusLast: () => void;

  /**
   * Function to focus the next element
   */
  focusNext: () => void;

  /**
   * Function to focus the previous element
   */
  focusPrevious: () => void;

  /**
   * Function to get all focusable elements
   */
  getFocusableElements: () => HTMLElement[];
}

/**
 * Hook for managing keyboard navigation within a container
 */
export const useKeyboardNavigation = ({
  enabled = true,
  direction = 'both',
  loop = true,
  onEnter,
  onSpace,
  onEscape,
  onArrowKey,
}: UseKeyboardNavigationOptions = {}): UseKeyboardNavigationReturn => {
  const containerRef = useRef<HTMLElement>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    const elements = containerRef.current.querySelectorAll(
      focusableSelectors.join(', ')
    );
    return Array.from(elements) as HTMLElement[];
  }, []);

  // Focus first element
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);

  // Focus last element
  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);

  // Focus next element
  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    const activeElement = document.activeElement as HTMLElement;

    if (!activeElement || elements.length === 0) return;

    const currentIndex = elements.indexOf(activeElement);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex < elements.length) {
      elements[nextIndex].focus();
    } else if (loop) {
      elements[0].focus();
    }
  }, [getFocusableElements, loop]);

  // Focus previous element
  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    const activeElement = document.activeElement as HTMLElement;

    if (!activeElement || elements.length === 0) return;

    const currentIndex = elements.indexOf(activeElement);
    if (currentIndex === -1) return;

    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      elements[prevIndex].focus();
    } else if (loop) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements, loop]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const isArrowKey = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
      ].includes(event.key);

      // Handle arrow key navigation
      if (isArrowKey) {
        event.preventDefault();

        switch (event.key) {
          case 'ArrowUp':
            if (direction === 'vertical' || direction === 'both') {
              focusPrevious();
              onArrowKey?.('up', target);
            }
            break;
          case 'ArrowDown':
            if (direction === 'vertical' || direction === 'both') {
              focusNext();
              onArrowKey?.('down', target);
            }
            break;
          case 'ArrowLeft':
            if (direction === 'horizontal' || direction === 'both') {
              focusPrevious();
              onArrowKey?.('left', target);
            }
            break;
          case 'ArrowRight':
            if (direction === 'horizontal' || direction === 'both') {
              focusNext();
              onArrowKey?.('right', target);
            }
            break;
        }
      }

      // Handle other keys
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          onEnter?.(target);
          break;
        case ' ':
          event.preventDefault();
          onSpace?.(target);
          break;
        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
      }
    },
    [
      enabled,
      direction,
      focusNext,
      focusPrevious,
      onEnter,
      onSpace,
      onEscape,
      onArrowKey,
    ]
  );

  // Set up keyboard event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements,
  };
};

/**
 * Hook for managing focus trapping within a modal or dialog
 */
export interface UseFocusTrapOptions {
  /**
   * Whether focus trapping is enabled
   */
  enabled?: boolean;

  /**
   * Whether to restore focus to the previously focused element when unmounting
   */
  restoreFocus?: boolean;

  /**
   * Initial focus behavior ('first' | 'container' | HTMLElement)
   */
  initialFocus?: 'first' | 'container' | HTMLElement;
}

export interface UseFocusTrapReturn {
  /**
   * Ref to attach to the container element
   */
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * Hook for trapping focus within a container (useful for modals)
 */
export const useFocusTrap = ({
  enabled = true,
  restoreFocus = true,
  initialFocus = 'first',
}: UseFocusTrapOptions = {}): UseFocusTrapReturn => {
  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<Element | null>(null);

  // Handle focus trapping
  const handleFocusTrap = useCallback(
    (event: FocusEvent) => {
      if (!enabled || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.target === lastElement) {
        // Focus moved to last element, wrap to first
        firstElement?.focus();
        event.preventDefault();
      } else if (event.target === firstElement) {
        // Focus moved to first element, wrap to last
        lastElement?.focus();
        event.preventDefault();
      }
    },
    [enabled]
  );

  // Set up focus trap
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Store previously focused element
    if (restoreFocus) {
      previouslyFocusedElement.current = document.activeElement;
    }

    // Set initial focus
    if (initialFocus === 'first') {
      const firstFocusable = container.querySelector(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    } else if (initialFocus === 'container') {
      container.focus();
    } else if (initialFocus instanceof HTMLElement) {
      initialFocus.focus();
    }

    // Add focus event listener
    document.addEventListener('focusin', handleFocusTrap);

    return () => {
      document.removeEventListener('focusin', handleFocusTrap);

      // Restore focus to previously focused element
      if (
        restoreFocus &&
        previouslyFocusedElement.current instanceof HTMLElement
      ) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [handleFocusTrap, enabled, restoreFocus, initialFocus]);

  return {
    containerRef,
  };
};
