import { cn } from '@/utils/cn';

describe('cn utility', () => {
  it('should merge tailwind classes with clsx', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should merge conflicting tailwind classes', () => {
    const result = cn('text-red-500 text-blue-500');
    expect(result).toContain('text-blue-500');
  });
});