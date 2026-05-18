import { describe, it, expect } from 'vitest';
import { AccessibilitySchema } from '../../schemas/accessibility.schema';

// Helper function to safely get first issue path
function getFirstIssuePath(result: ReturnType<typeof AccessibilitySchema.safeParse>): string | undefined {
  if (!result.success) {
    return result.error.issues[0]?.path[0]?.toString();
  }
  return undefined;
}

describe('AccessibilitySchema', () => {
  describe('disabilityType validation', () => {
    it('should pass with valid single disability type', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['visual'],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(true);
    });

    it('should pass with valid multiple disability types', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['visual', 'physical', 'hearing'],
        needsAudioDescription: true,
      });
      expect(result.success).toBe(true);
    });

    it('should pass with array at boundary (1 item)', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['visual'],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(true);
    });

    it('should fail with empty disabilityType array', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: [],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(false);
      expect(getFirstIssuePath(result)).toBe('disabilityType');
    });

    it('should fail when disabilityType is missing', () => {
      const result = AccessibilitySchema.safeParse({
        needsAudioDescription: false,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('needsAudioDescription validation', () => {
    it('should pass with needsAudioDescription set to true', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['visual'],
        needsAudioDescription: true,
      });
      expect(result.success).toBe(true);
    });

    it('should pass with needsAudioDescription set to false', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['visual'],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(true);
    });

    it('should fail when needsAudioDescription is missing', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['visual'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('combined validation', () => {
    it('should fail when all fields are empty', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: [],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(false);
    });

    it('should fail with completely missing object', () => {
      const result = AccessibilitySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});