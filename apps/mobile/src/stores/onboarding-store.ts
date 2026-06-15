/**
 * Onboarding Store — persiste dados do formulário de onboarding
 * entre as etapas usando MMKV (síncrono, rápido).
 *
 * Os dados são coletados em cada etapa e, ao final, enviados
 * para a API via `createStudent`.
 */

import { storage } from "@/lib/storage";

const ONBOARDING_KEY = "onboarding-data";

export interface OnboardingData {
	name: string;
	phone: string;
	gender: string;
	course: string;
	shift: string;
	campus: string;
	enrollment: string;
	disabilityTypes: string[];
	simplifiedInterface: boolean;
}

const defaultData: OnboardingData = {
	name: "",
	phone: "",
	gender: "",
	course: "",
	shift: "",
	campus: "",
	enrollment: "",
	disabilityTypes: [],
	simplifiedInterface: false,
};

export function getOnboardingData(): OnboardingData {
	const raw = storage.getString(ONBOARDING_KEY);
	if (!raw) return { ...defaultData };
	try {
		return { ...defaultData, ...JSON.parse(raw) };
	} catch {
		return { ...defaultData };
	}
}

export function updateOnboardingData(partial: Partial<OnboardingData>) {
	const current = getOnboardingData();
	const merged = { ...current, ...partial };
	storage.set(ONBOARDING_KEY, JSON.stringify(merged));
}

export function clearOnboardingData() {
	storage.remove(ONBOARDING_KEY);
}
