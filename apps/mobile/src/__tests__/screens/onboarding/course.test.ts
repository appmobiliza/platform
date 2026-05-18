import { describe, it, expect } from 'vitest';
import { CourseInfoSchema } from '@/schemas/courseInfo.schema';
import { courseOptions, shiftOptions, campusOptions } from '@/constants';
import type { CourseInfo } from '@/types';

/**
 * CourseInfoScreen Integration Tests
 * 
 * These tests validate that the CourseInfo screen can properly:
 * 1. Collect data (course, shift, campus, matricula)
 * 2. Validate data using CourseInfoSchema
 * 3. Use options from constants
 */

describe('CourseInfoScreen Integration', () => {
  describe('Course Options', () => {
    it('should have at least 5 course options', () => {
      expect(courseOptions.length).toBeGreaterThanOrEqual(5);
    });

    it('should have valid SelectOption structure', () => {
      courseOptions.forEach((option) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
        expect(typeof option.label).toBe('string');
        expect(typeof option.value).toBe('string');
      });
    });

    it('should include common UFAL courses', () => {
      const labels = courseOptions.map((opt) => opt.label);
      expect(labels).toContain('Pedagogia');
      expect(labels).toContain('Ciência da Computação');
      expect(labels).toContain('Engenharia Civil');
      expect(labels).toContain('Direito');
      expect(labels).toContain('Medicina');
    });
  });

  describe('Shift Options', () => {
    it('should have 4 shift options', () => {
      expect(shiftOptions).toHaveLength(4);
    });

    it('should include all standard shifts', () => {
      const labels = shiftOptions.map((opt) => opt.label);
      expect(labels).toContain('Matutino');
      expect(labels).toContain('Vespertino');
      expect(labels).toContain('Noturno');
      expect(labels).toContain('Integral');
    });

    it('should have unique values', () => {
      const values = shiftOptions.map((opt) => opt.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('Campus Options', () => {
    it('should have 4 campus options', () => {
      expect(campusOptions).toHaveLength(4);
    });

    it('should include UFAL campuses', () => {
      const labels = campusOptions.map((opt) => opt.label);
      expect(labels).toContain('Campus A.C. Simões');
      expect(labels).toContain('Campus CECA');
      expect(labels).toContain('Campus Arapiraca');
      expect(labels).toContain('Campus Sertão');
    });
  });

  describe('CourseInfoSchema Validation', () => {
    it('should validate complete valid data', () => {
      const validData = {
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
      };
      const result = CourseInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with all shift options', () => {
      shiftOptions.forEach((option) => {
        const result = CourseInfoSchema.safeParse({
          course: 'Ciência da Computação',
          shift: option.value,
          campus: 'Campus A.C. Simões',
          matricula: '23415364',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should validate with all campus options', () => {
      campusOptions.forEach((option) => {
        const result = CourseInfoSchema.safeParse({
          course: 'Ciência da Computação',
          shift: 'Integral',
          campus: option.value,
          matricula: '23415364',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid matrícula formats', () => {
      const matriculas = [
        '23415364',           // 8 digits
        '12345',              // 5 digits (minimum)
        '12345678901234567890', // 20 digits (maximum)
      ];

      matriculas.forEach((matricula) => {
        const result = CourseInfoSchema.safeParse({
          course: 'Ciência da Computação',
          shift: 'Integral',
          campus: 'Campus A.C. Simões',
          matricula,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject matrícula with less than 5 digits', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '1234',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty course', () => {
      const result = CourseInfoSchema.safeParse({
        course: '',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty shift', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: '',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty campus', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: '',
        matricula: '23415364',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty matrícula', () => {
      const result = CourseInfoSchema.safeParse({
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should accept valid CourseInfo type', () => {
      const data: CourseInfo = {
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
      };
      const result = CourseInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing fields', () => {
      const incompleteData = {
        course: 'Ciência da Computação',
        // shift missing
        // campus missing
        // matricula missing
      };
      const result = CourseInfoSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });
});