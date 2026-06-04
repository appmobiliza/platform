export {
	cleanCpf,
	cleanPhone,
	cpfRegex,
	formatCpf,
	formatPhone,
	nameRegex,
	phoneRegex,
	validateCpf,
	validateEnrollment,
	validateName,
	validatePhone,
} from "@mobiliza/contracts";

/**
 * Gender validation
 */
export function validateGender(gender: string): boolean {
	const validGenders = [
		"Feminino",
		"Masculino",
		"Não-binário",
		"Prefiro não informar",
	];
	return validGenders.includes(gender);
}

/**
 * Shift validation
 */
export function validateShift(shift: string): boolean {
	const validShifts = ["Matutino", "Vespertino", "Noturno", "Integral"];
	return validShifts.includes(shift);
}

/**
 * Campus validation
 */
export function validateCampus(campus: string): boolean {
	const validCampuses = [
		"Campus A.C. Simões",
		"Campus CECA",
		"Campus Arapiraca",
		"Campus Sertão",
	];
	return validCampuses.includes(campus);
}

/**
 * Disability type validation
 */
export function validateDisabilityType(types: string[]): boolean {
	const validTypes = ["physical", "hearing", "visual", "other"];
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
