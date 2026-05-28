import type { ScholarProfile, StudentProfile, User } from "@mobiliza/db/schema";

import { scholars, students, users } from "@/data/mock";

export type ServiceStatus = "concluded" | "in_progress" | "not_attended";

export type ServiceEntry = {
	id: string;
	date: string;
	duration: string;
	notes: string;
	route: string;
	status: ServiceStatus;
	student: {
		user: User;
		profile: StudentProfile;
	};
	scholar: {
		user: User;
		profile: ScholarProfile;
	};
	time: string;
};

export const dashboardCards: Array<{
	title: string;
	value: string;
	variant?: "default" | "destructive";
}> = [
	{
		title: "Total no mês",
		value: "94",
	},
	{
		title: "Tempo médio",
		value: "~14 min",
	},
	{
		title: "Não atendidos",
		value: "3",
		variant: "destructive",
	},
] as const;

export const serviceEntries: ServiceEntry[] = [
	{
		id: "entry-1",
		date: "24/04",
		duration: "18 min",
		notes: "Conduzido sem intercorrências, com destino final na Biblioteca Central.",
		route: "IC → Biblioteca",
		status: "concluded",
		student: {
			user: users[4]!,
			profile: students[0]!,
		},
		scholar: {
			user: users[0]!,
			profile: scholars[0]!,
		},
		time: "09h00",
	},
	{
		id: "entry-2",
		date: "24/04",
		duration: "14 min",
		notes: "Solicitação iniciada no fim da manhã e ainda em atendimento.",
		route: "RU → IC",
		status: "in_progress",
		student: {
			user: users[3]!,
			profile: students[1]!,
		},
		scholar: {
			user: users[1]!,
			profile: scholars[1]!,
		},
		time: "10h30",
	},
	{
		id: "entry-3",
		date: "24/04",
		duration: "-",
		notes: "O atendimento não foi concluído dentro da janela prevista.",
		route: "Biblioteca → RU",
		status: "not_attended",
		student: {
			user: users[1]!,
			profile: students[2]!,
		},
		scholar: {
			user: users[2]!,
			profile: scholars[2]!,
		},
		time: "11h15",
	},
] as const;
