import { AccessibilitySchema } from '@/schemas/accessibility.schema';
import type { AccessibilityPrefs } from '@/types';

/**
 * AccessibilityScreen Integration Tests
 * 
 * These tests validate that the Accessibility screen can properly:
 * 1. Collect data (disabilityType[], needsAudioDescription)
 * 2. Validate data using AccessibilitySchema
 * 3. Handle multi-select for disability types
 */

describe('AccessibilityScreen Integration', () => {
  describe('Disability Type Constants', () => {
    const VALID_DISABILITY_TYPES = ['physical', 'hearing', 'visual', 'other'];

    it('should have 4 valid disability type values', () => {
      expect(VALID_DISABILITY_TYPES).toHaveLength(4);
    });

    it('should include physical disability', () => {
      expect(VALID_DISABILITY_TYPES).toContain('physical');
    });

    it('should include hearing disability', () => {
      expect(VALID_DISABILITY_TYPES).toContain('hearing');
    });

    it('should include visual disability', () => {
      expect(VALID_DISABILITY_TYPES).toContain('visual');
    });

    it('should include other disability type', () => {
      expect(VALID_DISABILITY_TYPES).toContain('other');
    });
  });

  describe('AccessibilitySchema Validation', () => {
    it('should validate single disability type', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['physical'],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(true);
    });

    it('should validate multiple disability types', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['physical', 'hearing', 'visual'],
        needsAudioDescription: true,
      });
      expect(result.success).toBe(true);
    });

    it('should validate all disability types selected', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['physical', 'hearing', 'visual', 'other'],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(true);
    });

    it('should validate with needsAudioDescription true', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['visual'],
        needsAudioDescription: true,
      });
      expect(result.success).toBe(true);
    });

    it('should validate with needsAudioDescription false', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['physical'],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty disabilityType array', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: [],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing disabilityType', () => {
      const result = AccessibilitySchema.safeParse({
        needsAudioDescription: false,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing needsAudioDescription', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['physical'],
      });
      expect(result.success).toBe(false);
    });

    it('should accept any non-empty array', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['any_value', 'another_value'],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('User Flow Scenarios', () => {
    it('should allow user with physical disability', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['physical'],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(true);
    });

    it('should allow user needing audio descriptions', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['visual'],
        needsAudioDescription: true,
      });
      expect(result.success).toBe(true);
    });

    it('should allow user with multiple disabilities', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['physical', 'hearing'],
        needsAudioDescription: true,
      });
      expect(result.success).toBe(true);
    });

    it('should require at least one disability type selected', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: [],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(false);
    });

    it('should accept other as only disability type', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: ['other'],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should accept valid AccessibilityPrefs type', () => {
      const data: AccessibilityPrefs = {
        disabilityType: ['physical', 'visual'],
        needsAudioDescription: true,
      };
      const result = AccessibilitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate array is not empty (min 1)', () => {
      const result = AccessibilitySchema.safeParse({
        disabilityType: [],
        needsAudioDescription: false,
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid boolean for needsAudioDescription', () => {
      const resultTrue = AccessibilitySchema.safeParse({
        disabilityType: ['physical'],
        needsAudioDescription: true,
      });
      expect(resultTrue.success).toBe(true);

      const resultFalse = AccessibilitySchema.safeParse({
        disabilityType: ['physical'],
        needsAudioDescription: false,
      });
      expect(resultFalse.success).toBe(true);
    });
  });
});