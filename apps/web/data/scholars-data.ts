import type { ScholarProfile, User } from "@mobiliza/db/schema";

import { scholars, users } from "@/data/mock";

export const dashboardCards: Array<{
	title: string;
	value: string;
	variant?: "default" | "green" | "yellow";
}> = [
	{
		title: "Total de bolsistas",
		value: "7",
	},
	{
		title: "Disponível agora",
		value: "3",
		variant: "green",
	},
	{
		title: "Em atendimento",
		value: "2",
		variant: "yellow",
	},
] as const;

interface SummaryData {
	servicesAmounted: number;
	monthHours: number;
	averageDuration: string;
	servicesPerWeek: Array<{
		week: string;
		amount: number;
	}>;
	frequentRoutes: Array<{
		route: string;
		amount: number;
	}>;
	frequentStudents: Array<{
		name: string;
		amount: number;
	}>;
}

export type ScholarData = {
	user: User;
	profile: ScholarProfile;
	summary: SummaryData;
};

const summaries: SummaryData[] = [
	{
		servicesAmounted: 94,
		monthHours: 22,
		averageDuration: "~14 min",
		servicesPerWeek: [
			{ week: "17/06 - 23/06", amount: 20 },
			{ week: "24/06 - 30/06", amount: 30 },
			{ week: "01/07 - 07/07", amount: 25 },
			{ week: "08/07 - 14/07", amount: 19 },
		],
		frequentRoutes: [
			{ route: "IC → Biblioteca", amount: 15 },
			{ route: "RU → IC", amount: 12 },
			{ route: "IC → RU", amount: 10 },
		],
		frequentStudents: [
			{ name: "Maria Silva", amount: 8 },
			{ name: "Lucas Almeida", amount: 6 },
			{ name: "Ana Souza", amount: 5 },
		],
	},
	{
		servicesAmounted: 48,
		monthHours: 12,
		averageDuration: "~15 min",
		servicesPerWeek: [
			{ week: "17/06 - 23/06", amount: 10 },
			{ week: "24/06 - 30/06", amount: 12 },
			{ week: "01/07 - 07/07", amount: 14 },
			{ week: "08/07 - 14/07", amount: 12 },
		],
		frequentRoutes: [
			{ route: "Prédio A → Biblioteca", amount: 9 },
			{ route: "RU → Prédio B", amount: 7 },
			{ route: "Prédio C → RU", amount: 5 },
		],
		frequentStudents: [
			{ name: "Pedro Gomes", amount: 4 },
			{ name: "Carla Mendes", amount: 3 },
			{ name: "Rafael Costa", amount: 2 },
		],
	},
	{
		servicesAmounted: 120,
		monthHours: 40,
		averageDuration: "~20 min",
		servicesPerWeek: [
			{ week: "17/06 - 23/06", amount: 30 },
			{ week: "24/06 - 30/06", amount: 32 },
			{ week: "01/07 - 07/07", amount: 28 },
			{ week: "08/07 - 14/07", amount: 30 },
		],
		frequentRoutes: [
			{ route: "Entrada → Laboratório", amount: 20 },
			{ route: "Laboratório → RU", amount: 15 },
			{ route: "Biblioteca → Entrada", amount: 10 },
		],
		frequentStudents: [
			{ name: "Beatriz Lima", amount: 12 },
			{ name: "João Pedro", amount: 9 },
			{ name: "Sofia Ribeiro", amount: 7 },
		],
	},
	{
		servicesAmounted: 36,
		monthHours: 8,
		averageDuration: "~10 min",
		servicesPerWeek: [
			{ week: "17/06 - 23/06", amount: 8 },
			{ week: "24/06 - 30/06", amount: 10 },
			{ week: "01/07 - 07/07", amount: 9 },
			{ week: "08/07 - 14/07", amount: 9 },
		],
		frequentRoutes: [
			{ route: "IC → Bloco D", amount: 6 },
			{ route: "Bloco D → RU", amount: 5 },
			{ route: "IC → RU", amount: 4 },
		],
		frequentStudents: [
			{ name: "Mariana Rocha", amount: 3 },
			{ name: "Diego Fernandes", amount: 3 },
			{ name: "Lucas Pinto", amount: 2 },
		],
	},
];

export const scholarsData: ScholarData[] = summaries.map((summary, index) => ({
	user: users[index]!,
	profile: scholars[index]!,
	summary,
}));
