export interface BasicInfo {
	name: string;
	phone: string;
	gender: string;
}

export interface CourseInfo {
	course: string;
	shift: string;
	campus: string;
	matricula: string;
}

export interface AccessibilityPrefs {
	disabilityType: string[];
	needsAudioDescription: boolean;
}

export interface User {
	id: string;
	basicInfo: BasicInfo;
	courseInfo: CourseInfo;
	accessibilityPrefs: AccessibilityPrefs;
}

export type OnboardingData = BasicInfo & CourseInfo & AccessibilityPrefs;
