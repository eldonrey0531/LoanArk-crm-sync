/**
 * Utility functions for consistent date formatting across the application
 */

export type DateInput = string | Date | null | undefined;

/**
 * Format a date string or Date object for display in tables
 * @param dateValue - Date string, Date object, or null/undefined
 * @returns Formatted date string or 'N/A' if invalid
 */
export const formatCreateDate = (dateValue: DateInput): string => {
  if (!dateValue) return 'N/A';

  try {
    const date =
      typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    // Format as: MM/DD/YYYY HH:MM AM/PM
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.warn('Error formatting date:', dateValue, error);
    return 'N/A';
  }
};

/**
 * Format a date for sorting purposes (ISO string)
 * @param dateValue - Date string, Date object, or null/undefined
 * @returns ISO string or empty string if invalid
 */
export const formatDateForSorting = (dateValue: DateInput): string => {
  if (!dateValue) return '';

  try {
    const date =
      typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return isNaN(date.getTime()) ? '' : date.toISOString();
  } catch (error) {
    console.warn('Error formatting date for sorting:', dateValue, error);
    return '';
  }
};

/**
 * Check if a date is valid
 * @param dateValue - Date string, Date object, or null/undefined
 * @returns true if date is valid, false otherwise
 */
export const isValidDate = (dateValue: DateInput): boolean => {
  if (!dateValue) return false;

  try {
    const date =
      typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return !isNaN(date.getTime());
  } catch (error) {
    console.warn('Error validating date:', dateValue, error);
    return false;
  }
};
