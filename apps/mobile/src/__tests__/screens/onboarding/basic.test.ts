import { describe, it, expect } from 'vitest';
import { BasicInfoSchema } from '@/schemas/basicInfo.schema';
import { genderOptions } from '@/constants';
import type { BasicInfo } from '@/types';

/**
 * BasicInfoScreen Integration Tests
 * 
 * These tests validate that the BasicInfo screen can properly:
 * 1. Collect data (name, phone, gender)
 * 2. Validate data using BasicInfoSchema
 * 3. Use genderOptions from constants
 * 
 * Note: Schema validates structure (required fields, length constraints)
 * Format validation (regex) is handled by utils/validation.ts at UI level
 */

describe('BasicInfoScreen Integration', () => {
  describe('Gender Options', () => {
    it('should have 4 gender options', () => {
      expect(genderOptions).toHaveLength(4);
    });

    it('should have valid SelectOption structure', () => {
      genderOptions.forEach((option) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
        expect(typeof option.label).toBe('string');
        expect(typeof option.value).toBe('string');
        expect(option.label.length).toBeGreaterThan(0);
        expect(option.value.length).toBeGreaterThan(0);
      });
    });

    it('should include standard Brazilian gender options', () => {
      const labels = genderOptions.map((opt) => opt.label);
      expect(labels).toContain('Feminino');
      expect(labels).toContain('Masculino');
      expect(labels).toContain('Não-binário');
      expect(labels).toContain('Prefiro não informar');
    });

    it('should have unique values', () => {
      const values = genderOptions.map((opt) => opt.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('BasicInfoSchema Validation', () => {
    it('should validate complete valid data', () => {
      const validData = {
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
      };
      const result = BasicInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with all gender options', () => {
      genderOptions.forEach((option) => {
        const result = BasicInfoSchema.safeParse({
          name: 'Test User',
          phone: '82999998888',
          gender: option.value,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should accept Brazilian names with accents', () => {
      const brazilianNames = [
        'Antônio Silva',
        'Fernandes Júnior',
        'São Paulo',
        'Mário Ünderson',
      ];

      brazilianNames.forEach((name) => {
        const result = BasicInfoSchema.safeParse({
          name,
          phone: '82999998888',
          gender: 'Masculino',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject name shorter than 2 chars', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'J',
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 chars', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'J'.repeat(101),
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should reject phone shorter than 10 chars', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '123456789',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should reject phone longer than 20 chars', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '1'.repeat(21),
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty gender', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        phone: '82999998888',
        gender: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = BasicInfoSchema.safeParse({
        name: '',
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const result = BasicInfoSchema.safeParse({
        phone: '82999998888',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing phone', () => {
      const result = BasicInfoSchema.safeParse({
        name: 'João Silva',
        gender: 'Masculino',
      });
      expect(result.success).toBe(false);
    });

    it('should reject completely empty object', () => {
      const result = BasicInfoSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should accept valid BasicInfo type', () => {
      const data: BasicInfo = {
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
      };
      const result = BasicInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});