import type { StudentProfile, User } from "@mobiliza/db/schema";

import { students, users } from "@/data/mock";

export const dashboardCards: Array<{
	title: string;
	value: string;
	variant?: "default" | "blue";
}> = [
	{
		title: "Total de alunos",
		value: "9",
	},
	{
		title: "Com solicitação hoje",
		value: "3",
		variant: "blue",
	},
	{
		title: "Deficiência visual",
		value: "4",
	},
	{
		title: "Deficiência motora",
		value: "5",
	},
] as const;

interface SummaryData {
	servicesAmount: number;
	monthHours: number;
	averageDuration: number;
	frequentRoutes: Array<{
		route: string;
		amount: number;
	}>;
	recentRoutes: Array<{
		route: string;
		date: string;
		status: "completed" | "pending" | "canceled";
	}>;
	frequentScholars: Array<{
		name: string;
		amount: number;
	}>;
}

export type StudentData = {
	user: User;
	profile: StudentProfile & { disabilities: string[] };
	summary: SummaryData;
};

const summaries: SummaryData[] = [
	{
		servicesAmount: 94,
		monthHours: 22,
		averageDuration: 14,
		frequentRoutes: [
			{ route: "IC → Biblioteca", amount: 15 },
			{ route: "RU → IC", amount: 12 },
			{ route: "IC → RU", amount: 10 },
		],
		recentRoutes: [
			{
				route: "IC → Biblioteca",
				date: "2024-07-10",
				status: "completed",
			},
			{ route: "RU → IC", date: "2024-07-11", status: "pending" },
			{ route: "IC → RU", date: "2024-07-12", status: "canceled" },
		],
		frequentScholars: [
			{ name: "Maria Silva", amount: 8 },
			{ name: "Lucas Almeida", amount: 6 },
			{ name: "Ana Souza", amount: 5 },
		],
	},
	{
		servicesAmount: 88,
		monthHours: 19,
		averageDuration: 16,
		frequentRoutes: [
			{ route: "Campus → Biblioteca", amount: 14 },
			{ route: "RU → Prédio de Letras", amount: 11 },
			{ route: "IC → Laboratórios", amount: 9 },
		],
		recentRoutes: [
			{
				route: "Campus → Biblioteca",
				date: "2024-07-13",
				status: "completed",
			},
			{
				route: "RU → Prédio de Letras",
				date: "2024-07-14",
				status: "pending",
			},
			{
				route: "IC → Laboratórios",
				date: "2024-07-15",
				status: "completed",
			},
		],
		frequentScholars: [
			{ name: "Pedro Henrique", amount: 7 },
			{ name: "Juliana Costa", amount: 6 },
			{ name: "Fernanda Lima", amount: 5 },
		],
	},
	{
		servicesAmount: 102,
		monthHours: 26,
		averageDuration: 13,
		frequentRoutes: [
			{ route: "Biblioteca → RU", amount: 16 },
			{ route: "IC → Reitoria", amount: 13 },
			{ route: "Reitoria → IC", amount: 11 },
		],
		recentRoutes: [
			{
				route: "Biblioteca → RU",
				date: "2024-07-16",
				status: "completed",
			},
			{ route: "IC → Reitoria", date: "2024-07-17", status: "pending" },
			{ route: "Reitoria → IC", date: "2024-07-18", status: "completed" },
		],
		frequentScholars: [
			{ name: "Bruno Santos", amount: 9 },
			{ name: "Carla Mendes", amount: 7 },
			{ name: "Rafael Pereira", amount: 6 },
		],
	},
	{
		servicesAmount: 76,
		monthHours: 17,
		averageDuration: 15,
		frequentRoutes: [
			{ route: "IC → Restaurante Universitário", amount: 12 },
			{ route: "RU → IC", amount: 10 },
			{ route: "Biblioteca → IC", amount: 8 },
		],
		recentRoutes: [
			{
				route: "IC → Restaurante Universitário",
				date: "2024-07-19",
				status: "completed",
			},
			{ route: "RU → IC", date: "2024-07-20", status: "canceled" },
			{ route: "Biblioteca → IC", date: "2024-07-21", status: "pending" },
		],
		frequentScholars: [
			{ name: "Letícia Rocha", amount: 6 },
			{ name: "Gustavo Ferreira", amount: 5 },
			{ name: "Beatriz Alves", amount: 4 },
		],
	},
	{
		servicesAmount: 110,
		monthHours: 29,
		averageDuration: 12,
		frequentRoutes: [
			{ route: "IC → Biblioteca Central", amount: 18 },
			{ route: "Biblioteca Central → IC", amount: 15 },
			{ route: "Campus Norte → IC", amount: 12 },
		],
		recentRoutes: [
			{
				route: "IC → Biblioteca Central",
				date: "2024-07-22",
				status: "completed",
			},
			{
				route: "Biblioteca Central → IC",
				date: "2024-07-23",
				status: "completed",
			},
			{
				route: "Campus Norte → IC",
				date: "2024-07-24",
				status: "pending",
			},
		],
		frequentScholars: [
			{ name: "Thiago Nunes", amount: 10 },
			{ name: "Aline Borges", amount: 8 },
			{ name: "Mariana Freitas", amount: 7 },
		],
	},
	{
		servicesAmount: 69,
		monthHours: 15,
		averageDuration: 17,
		frequentRoutes: [
			{ route: "RU → Biblioteca", amount: 11 },
			{ route: "Biblioteca → RU", amount: 9 },
			{ route: "IC → RU", amount: 7 },
		],
		recentRoutes: [
			{
				route: "RU → Biblioteca",
				date: "2024-07-25",
				status: "completed",
			},
			{ route: "Biblioteca → RU", date: "2024-07-26", status: "pending" },
			{ route: "IC → RU", date: "2024-07-27", status: "canceled" },
		],
		frequentScholars: [
			{ name: "Eduarda Martins", amount: 5 },
			{ name: "Caio Vasconcelos", amount: 4 },
			{ name: "Manuela Azevedo", amount: 4 },
		],
	},
	{
		servicesAmount: 97,
		monthHours: 23,
		averageDuration: 14,
		frequentRoutes: [
			{ route: "IC → Residência", amount: 15 },
			{ route: "Residência → IC", amount: 12 },
			{ route: "RU → Residência", amount: 10 },
		],
		recentRoutes: [
			{
				route: "IC → Residência",
				date: "2024-07-28",
				status: "completed",
			},
			{
				route: "Residência → IC",
				date: "2024-07-29",
				status: "completed",
			},
			{ route: "RU → Residência", date: "2024-07-30", status: "pending" },
		],
		frequentScholars: [
			{ name: "Felipe Oliveira", amount: 8 },
			{ name: "Bianca Teixeira", amount: 7 },
			{ name: "João Victor", amount: 6 },
		],
	},
	{
		servicesAmount: 81,
		monthHours: 18,
		averageDuration: 16,
		frequentRoutes: [
			{ route: "Campus Sul → IC", amount: 13 },
			{ route: "IC → Campus Sul", amount: 11 },
			{ route: "Biblioteca → Campus Sul", amount: 8 },
		],
		recentRoutes: [
			{
				route: "Campus Sul → IC",
				date: "2024-07-31",
				status: "completed",
			},
			{ route: "IC → Campus Sul", date: "2024-08-01", status: "pending" },
			{
				route: "Biblioteca → Campus Sul",
				date: "2024-08-02",
				status: "completed",
			},
		],
		frequentScholars: [
			{ name: "Sofia Ribeiro", amount: 6 },
			{ name: "Henrique Melo", amount: 5 },
			{ name: "Larissa Pires", amount: 4 },
		],
	},
	{
		servicesAmount: 115,
		monthHours: 31,
		averageDuration: 11,
		frequentRoutes: [
			{ route: "IC → Auditório", amount: 19 },
			{ route: "Auditório → IC", amount: 16 },
			{ route: "RU → Auditório", amount: 12 },
		],
		recentRoutes: [
			{
				route: "IC → Auditório",
				date: "2024-08-03",
				status: "completed",
			},
			{
				route: "Auditório → IC",
				date: "2024-08-04",
				status: "completed",
			},
			{ route: "RU → Auditório", date: "2024-08-05", status: "pending" },
		],
		frequentScholars: [
			{ name: "Ricardo Lopes", amount: 10 },
			{ name: "Camila Prado", amount: 8 },
			{ name: "Patrícia Gomes", amount: 7 },
		],
	},
	{
		servicesAmount: 73,
		monthHours: 16,
		averageDuration: 15,
		frequentRoutes: [
			{ route: "IC → Centro de Vivência", amount: 12 },
			{ route: "Centro de Vivência → IC", amount: 9 },
			{ route: "RU → Centro de Vivência", amount: 7 },
		],
		recentRoutes: [
			{
				route: "IC → Centro de Vivência",
				date: "2024-08-06",
				status: "completed",
			},
			{
				route: "Centro de Vivência → IC",
				date: "2024-08-07",
				status: "canceled",
			},
			{
				route: "RU → Centro de Vivência",
				date: "2024-08-08",
				status: "pending",
			},
		],
		frequentScholars: [
			{ name: "Daniela Cunha", amount: 5 },
			{ name: "Matheus Barros", amount: 4 },
			{ name: "Isabela Dias", amount: 4 },
		],
	},
	{
		servicesAmount: 108,
		monthHours: 28,
		averageDuration: 12,
		frequentRoutes: [
			{ route: "IC → Enfermaria", amount: 17 },
			{ route: "Enfermaria → IC", amount: 14 },
			{ route: "Biblioteca → Enfermaria", amount: 11 },
		],
		recentRoutes: [
			{
				route: "IC → Enfermaria",
				date: "2024-08-09",
				status: "completed",
			},
			{ route: "Enfermaria → IC", date: "2024-08-10", status: "pending" },
			{
				route: "Biblioteca → Enfermaria",
				date: "2024-08-11",
				status: "completed",
			},
		],
		frequentScholars: [
			{ name: "Vanessa Martins", amount: 9 },
			{ name: "Leandro Cardoso", amount: 7 },
			{ name: "Júlia Moreira", amount: 6 },
		],
	},
];

export const studentsData: StudentData[] = summaries.map((summary, index) => ({
	user: users[index]!,
	profile: { disabilities: ["Visual", "Motora"], ...students[index]! },
	summary,
}));
