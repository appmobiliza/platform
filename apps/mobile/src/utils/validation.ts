import { z } from 'zod';

/**
 * Phone number validation utilities
 * Accepts formats: (XX) XXXXX-XXXX, XX XXXXX XXXX, XXXXXXXXXX
 */
export const phoneRegex = /^\(?\d{2}\)?[\s]?\d{4,5}[\s-]?\d{4}$/;

export function validatePhone(phone: string): boolean {
  return phoneRegex.test(phone);
}

export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Format as (XX) XXXXX-XXXX
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Matrícula validation (UFAL format)
 * Expected: 5-20 digits
 */
export function validateMatricula(matricula: string): boolean {
  const digitsOnly = matricula.replace(/\D/g, '');
  return digitsOnly.length >= 5 && digitsOnly.length <= 20;
}

/**
 * Name validation
 * Min 2 chars, max 100 chars, allows Brazilian characters
 */
export const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,100}$/;

export function validateName(name: string): boolean {
  return nameRegex.test(name.trim());
}

/**
 * Gender validation
 */
export function validateGender(gender: string): boolean {
  const validGenders = ['Feminino', 'Masculino', 'Não-binário', 'Prefiro não informar'];
  return validGenders.includes(gender);
}

/**
 * Course validation
 */
export function validateCourse(course: string): boolean {
  const validCourses = [
    'Pedagogia',
    'Ciência da Computação',
    'Engenharia Civil',
    'Direito',
    'Medicina',
  ];
  return validCourses.includes(course);
}

/**
 * Shift validation
 */
export function validateShift(shift: string): boolean {
  const validShifts = ['Matutino', 'Vespertino', 'Noturno', 'Integral'];
  return validShifts.includes(shift);
}

/**
 * Campus validation
 */
export function validateCampus(campus: string): boolean {
  const validCampuses = [
    'Campus A.C. Simões',
    'Campus CECA',
    'Campus Arapiraca',
    'Campus Sertão',
  ];
  return validCampuses.includes(campus);
}

/**
 * Disability type validation
 */
export function validateDisabilityType(types: string[]): boolean {
  const validTypes = ['physical', 'hearing', 'visual', 'other'];
  return types.length > 0 && types.every((t) => validTypes.includes(t));
}

/**
 * Form data aggregator for onboarding
 */
export interface OnboardingFormData {
  name?: string;
  phone?: string;
  gender?: string;
  course?: string;
  shift?: string;
  campus?: string;
  matricula?: string;
  disabilityType?: string[];
  needsAudioDescription?: boolean;
}

export function isOnboardingComplete(data: OnboardingFormData): boolean {
  return !!(
    data.name &&
    data.phone &&
    data.gender &&
    data.course &&
    data.shift &&
    data.campus &&
    data.matricula &&
    data.disabilityType &&
    data.disabilityType.length > 0
  );
}

export function getOnboardingProgress(data: OnboardingFormData): number {
  const fields = [
    data.name,
    data.phone,
    data.gender,
    data.course,
    data.shift,
    data.campus,
    data.matricula,
    data.disabilityType && data.disabilityType.length > 0,
  ].filter(Boolean);

  return Math.round((fields.length / 8) * 100);
}