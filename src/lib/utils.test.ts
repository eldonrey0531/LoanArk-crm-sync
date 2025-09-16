import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    expect(cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled'
    )).toBe('base-class active');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle empty values', () => {
    expect(cn('class1', null, undefined, '', 'class2')).toBe('class1 class2');
  });

  it('should handle array inputs', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should handle object inputs', () => {
    expect(cn({ 'class1': true, 'class2': false }, 'class3')).toBe('class1 class3');
  });

  it('should return empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});