import { describe, it, expect } from 'vitest';
import {
  validatePhone,
  formatPhone,
  cleanPhone,
  validateMatricula,
  validateName,
  validateGender,
  validateCourse,
  validateShift,
  validateCampus,
  validateDisabilityType,
  isOnboardingComplete,
  getOnboardingProgress,
} from '@/utils/validation';

describe('Phone Validation', () => {
  describe('validatePhone', () => {
    it('should validate correct phone formats', () => {
      expect(validatePhone('82999998888')).toBe(true);
      expect(validatePhone('(82) 99999-8888')).toBe(true);
      expect(validatePhone('82 99999 8888')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abcdefgh')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });

    it('should reject phone with wrong digit count', () => {
      expect(validatePhone('8299999')).toBe(false); // too short
      expect(validatePhone('829999999999')).toBe(false); // too long
    });
  });

  describe('formatPhone', () => {
    it('should format 11-digit phone correctly', () => {
      expect(formatPhone('82999998888')).toBe('(82) 99999-8888');
    });

    it('should format 10-digit phone correctly', () => {
      expect(formatPhone('8299998888')).toBe('(82) 9999-8888');
    });

    it('should return original for invalid phone', () => {
      expect(formatPhone('123')).toBe('123');
    });
  });

  describe('cleanPhone', () => {
    it('should remove all non-digits', () => {
      expect(cleanPhone('(82) 99999-8888')).toBe('82999998888');
      expect(cleanPhone('82-99999-8888')).toBe('82999998888');
    });
  });
});

describe('Matrícula Validation', () => {
  it('should accept valid matrícula (5-20 digits)', () => {
    expect(validateMatricula('12345')).toBe(true);
    expect(validateMatricula('23415364')).toBe(true);
    expect(validateMatricula('12345678901234567890')).toBe(true);
  });

  it('should reject matrícula with less than 5 digits', () => {
    expect(validateMatricula('1234')).toBe(false);
    expect(validateMatricula('123')).toBe(false);
    expect(validateMatricula('')).toBe(false);
  });

  it('should reject matrícula with more than 20 digits', () => {
    expect(validateMatricula('123456789012345678901')).toBe(false);
  });
});

describe('Name Validation', () => {
  it('should accept valid names', () => {
    expect(validateName('João Silva')).toBe(true);
    expect(validateName('Maria')).toBe(true);
    expect(validateName('José Maria')).toBe(true);
  });

  it('should accept names with Brazilian characters', () => {
    expect(validateName('Antônio')).toBe(true);
    expect(validateName('Fernandes')).toBe(true);
    expect(validateName('Ünderson')).toBe(true);
  });

  it('should reject names shorter than 2 chars', () => {
    expect(validateName('J')).toBe(false);
    expect(validateName('')).toBe(false);
  });

  it('should reject names longer than 100 chars', () => {
    expect(validateName('J'.repeat(101))).toBe(false);
  });
});

describe('Gender Validation', () => {
  it('should accept valid genders', () => {
    expect(validateGender('Feminino')).toBe(true);
    expect(validateGender('Masculino')).toBe(true);
    expect(validateGender('Não-binário')).toBe(true);
    expect(validateGender('Prefiro não informar')).toBe(true);
  });

  it('should reject invalid genders', () => {
    expect(validateGender('Invalid')).toBe(false);
    expect(validateGender('')).toBe(false);
  });
});

describe('Course Validation', () => {
  it('should accept valid courses', () => {
    expect(validateCourse('Pedagogia')).toBe(true);
    expect(validateCourse('Ciência da Computação')).toBe(true);
  });

  it('should reject invalid courses', () => {
    expect(validateCourse('Invalid Course')).toBe(false);
    expect(validateCourse('')).toBe(false);
  });
});

describe('Shift Validation', () => {
  it('should accept valid shifts', () => {
    expect(validateShift('Matutino')).toBe(true);
    expect(validateShift('Vespertino')).toBe(true);
    expect(validateShift('Noturno')).toBe(true);
    expect(validateShift('Integral')).toBe(true);
  });

  it('should reject invalid shifts', () => {
    expect(validateShift('Morning')).toBe(false);
    expect(validateShift('')).toBe(false);
  });
});

describe('Campus Validation', () => {
  it('should accept valid campuses', () => {
    expect(validateCampus('Campus A.C. Simões')).toBe(true);
    expect(validateCampus('Campus CECA')).toBe(true);
    expect(validateCampus('Campus Arapiraca')).toBe(true);
    expect(validateCampus('Campus Sertão')).toBe(true);
  });

  it('should reject invalid campuses', () => {
    expect(validateCampus('Invalid Campus')).toBe(false);
    expect(validateCampus('')).toBe(false);
  });
});

describe('Disability Type Validation', () => {
  it('should accept valid disability types', () => {
    expect(validateDisabilityType(['physical'])).toBe(true);
    expect(validateDisabilityType(['hearing', 'visual'])).toBe(true);
    expect(validateDisabilityType(['physical', 'hearing', 'visual', 'other'])).toBe(true);
  });

  it('should reject empty array', () => {
    expect(validateDisabilityType([])).toBe(false);
  });

  it('should reject invalid types', () => {
    expect(validateDisabilityType(['invalid'])).toBe(false);
    expect(validateDisabilityType([''])).toBe(false);
  });
});

describe('Onboarding Helpers', () => {
  describe('isOnboardingComplete', () => {
    it('should return true when all fields are filled', () => {
      const data = {
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
        disabilityType: ['physical'],
      };
      expect(isOnboardingComplete(data)).toBe(true);
    });

    it('should return false when any required field is missing', () => {
      const data = {
        name: 'João Silva',
        phone: '82999998888',
        // missing gender
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
        disabilityType: ['physical'],
      };
      expect(isOnboardingComplete(data)).toBe(false);
    });

    it('should return false when disabilityType is empty array', () => {
      const data = {
        name: 'João Silva',
        phone: '82999998888',
        gender: 'Masculino',
        course: 'Ciência da Computação',
        shift: 'Integral',
        campus: 'Campus A.C. Simões',
        matricula: '23415364',
        disabilityType: [],
      };
      expect(isOnboardingComplete(data)).toBe(false);
    });
  });

  describe('getOnboardingProgress', () => {
    it('should calculate 0% progress for empty data', () => {
      expect(getOnboardingProgress({})).toBe(0);
    });

    it('should calculate 12.5% progress for 1 field', () => {
      expect(getOnboardingProgress({ name: 'João' })).toBe(13);
    });

    it('should calculate 50% progress for 4 fields', () => {
      expect(
        getOnboardingProgress({
          name: 'João',
          phone: '82999998888',
          gender: 'Masculino',
          course: 'CC',
        })
      ).toBe(50);
    });

    it('should calculate 100% progress for all fields', () => {
      expect(
        getOnboardingProgress({
          name: 'João',
          phone: '82999998888',
          gender: 'Masculino',
          course: 'CC',
          shift: 'Integral',
          campus: 'Campus',
          matricula: '12345',
          disabilityType: ['physical'],
        })
      ).toBe(100);
    });
  });
});