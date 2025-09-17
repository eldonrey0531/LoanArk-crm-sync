// src/utils/accessibility.ts

/**
 * Accessibility utilities for the Email Verification Data Display feature
 */

import {
  ContactComparison,
  ComparisonResponse,
} from '@/types/emailVerificationDataDisplay';

/**
 * Generate ARIA labels for table elements
 */
export const generateTableAriaLabels = () => ({
  table: 'Email verification data comparison table',
  row: (comparison: ContactComparison) =>
    `Contact ${comparison.supabase?.name || comparison.hubspot?.properties?.firstname} ${comparison.supabase?.name || comparison.hubspot?.properties?.lastname}, status: ${comparison.match_status.replace('_', ' ')}`,
  cell: (field: string, source: string) => `${field} from ${source}`,
  pagination: 'Data table pagination controls',
  filters: 'Data filtering and search controls',
  search: 'Search contacts by name or email',
  export: 'Export data options',
});

/**
 * Generate ARIA descriptions for status indicators
 */
export const generateStatusDescriptions = () => ({
  matched: 'Contact data matches between Supabase and HubSpot',
  supabase_only: 'Contact exists only in Supabase database',
  hubspot_only: 'Contact exists only in HubSpot CRM',
  mismatch: 'Contact data differs between Supabase and HubSpot',
});

/**
 * Generate live region announcements for screen readers
 */
export const generateLiveAnnouncements = {
  loading: (message: string) => `Loading ${message}`,
  loaded: (count: number) => `Loaded ${count} contact records`,
  error: (message: string) => `Error: ${message}`,
  filtered: (count: number, total: number) =>
    `Showing ${count} of ${total} filtered results`,
  selected: (count: number) => `${count} items selected`,
  exported: (format: string) => `Data exported as ${format} file`,
};

/**
 * Generate keyboard navigation instructions
 */
export const generateKeyboardInstructions = () => ({
  table:
    'Use arrow keys to navigate cells, Enter to select, Space to toggle selection',
  filters:
    'Use Tab to navigate between filter controls, Enter to apply filters',
  pagination: 'Use arrow keys to navigate pages, Enter to select page',
  search:
    'Type to search, use arrow keys to navigate suggestions, Enter to select',
});

/**
 * Utility to create accessible button props
 */
export const createAccessibleButtonProps = (
  label: string,
  description?: string,
  disabled?: boolean
) => ({
  'aria-label': label,
  'aria-describedby': description ? `${label}-description` : undefined,
  'aria-disabled': disabled,
  disabled,
});

/**
 * Utility to create accessible input props
 */
export const createAccessibleInputProps = (
  label: string,
  placeholder: string,
  required?: boolean,
  error?: string
) => ({
  'aria-label': label,
  'aria-required': required,
  'aria-invalid': !!error,
  'aria-describedby': error ? `${label}-error` : undefined,
  placeholder,
  required,
});

/**
 * Utility to create accessible table props
 */
export const createAccessibleTableProps = (
  label: string,
  description?: string,
  busy?: boolean
) => ({
  'aria-label': label,
  'aria-describedby': description ? `${label}-description` : undefined,
  'aria-busy': busy,
  role: 'table',
});

/**
 * Utility to create accessible row props
 */
export const createAccessibleRowProps = (
  label: string,
  selected?: boolean,
  expanded?: boolean
) => ({
  'aria-label': label,
  'aria-selected': selected,
  'aria-expanded': expanded,
  role: 'row',
});

/**
 * Utility to create accessible cell props
 */
export const createAccessibleCellProps = (label: string, header?: boolean) => ({
  'aria-label': label,
  role: header ? 'columnheader' : 'cell',
});

/**
 * Utility to announce dynamic content changes to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  document.body.appendChild(announcement);
  announcement.textContent = message;

  // Remove after announcement
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, 1000);
};

/**
 * Utility to manage focus for accessibility
 */
export const focusManagement = {
  /**
   * Move focus to the next focusable element
   */
  focusNext: (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(activeElement);

    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
    }
  },

  /**
   * Move focus to the previous focusable element
   */
  focusPrevious: (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(activeElement);

    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
    }
  },

  /**
   * Move focus to the first focusable element
   */
  focusFirst: (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  },

  /**
   * Move focus to the last focusable element
   */
  focusLast: (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  },
};

/**
 * Get all focusable elements within a container
 */
const getFocusableElements = (container?: HTMLElement): HTMLElement[] => {
  const target = container || document;
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  const elements = target.querySelectorAll(focusableSelectors.join(', '));
  return Array.from(elements) as HTMLElement[];
};

/**
 * Skip link utility for keyboard navigation
 */
export const createSkipLink = (targetId: string, label: string) => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 4px;
  `;

  // Show on focus
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  // Hide on blur
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  return skipLink;
};
