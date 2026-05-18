import { describe, it, expect } from 'vitest';
import { BasicInfoSchema } from '../../schemas/basicInfo.schema';

// Helper function to safely get first issue path
function getFirstIssuePath(result: ReturnType<typeof BasicInfoSchema.safeParse>): string | undefined {
  if (!result.success) {
    return result.error.issues[0]?.path[0]?.toString();
  }
  return undefined;
}

describe('BasicInfoSchema', () => {
  describe('name validation', () => {
    it('should pass with valid name', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with name at minimum length (2 chars)', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'Jo',
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with name at maximum length (100 chars)', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'J'.repeat(100),
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with name shorter than 2 chars', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'J',
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
      expect(getFirstIssuePath(result)).toBe('name');
    });

    it('should fail with empty name', () => {
      const result = BasicInfoSchema.safeParse({
        name: '',
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when name is missing', () => {
      const result = BasicInfoSchema.safeParse({
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with name exceeding 100 chars', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'J'.repeat(101),
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('phone validation', () => {
    it('should pass with valid phone (11 digits)', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with phone at minimum length (10 chars)', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '8299999888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with phone at maximum length (20 chars)', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '12345678901234567890',
        gender: 'Masculino',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with phone shorter than 10 chars', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '829999988',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
      expect(getFirstIssuePath(result)).toBe('phone');
    });

    it('should fail with empty phone', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when phone is missing', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with phone exceeding 20 chars', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '1'.repeat(21),
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('gender validation', () => {
    it('should pass with valid gender', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with empty gender', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '82999998888',
        gender: '',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when gender is missing', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '82999998888',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('combined validation', () => {
    it('should fail when all fields are empty', () => {
      const result = BasicInfoSchema.safeParse({
        name: '',
        phone: '',
        gender: '',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when only name is valid', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '',
        gender: '',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with completely missing object', () => {
      const result = BasicInfoSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});