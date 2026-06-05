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
	const digits = phone.replace(/\D/g, "").slice(0, 11);

	if (digits.length <= 2) {
		return digits;
	}

	if (digits.length <= 6) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	}

	if (digits.length <= 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}

	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function cleanPhone(phone: string): string {
	return phone.replace(/\D/g, "");
}

/**
 * CPF validation utilities
 * Accepts formats: XXX.XXX.XXX-XX and XXXXXXXXXXX
 */
export const cpfRegex = /^(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/;

export function validateCpf(cpf: string): boolean {
	return cpfRegex.test(cpf);
}

export function formatCpf(cpf: string): string {
	const digits = cpf.replace(/\D/g, "").slice(0, 11);

	if (digits.length <= 3) {
		return digits;
	}

	if (digits.length <= 6) {
		return `${digits.slice(0, 3)}.${digits.slice(3)}`;
	}

	if (digits.length <= 9) {
		return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
	}

	return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function cleanCpf(cpf: string): string {
	return cpf.replace(/\D/g, "");
}

/**
 * Matrícula (enrollment) validation
 * Expected: 5-20 digits
 */
export function validateEnrollment(matricula: string): boolean {
	const digitsOnly = matricula.replace(/\D/g, "");
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
