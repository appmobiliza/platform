export type ServiceStatus = "concluded" | "in_progress" | "not_attended";

export type ServiceEntry = {
	id: string;
	date: string;
	duration: string;
	notes: string;
	route: string;
	status: ServiceStatus;
	student: { name: string };
	scholar: { name: string };
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
			name: "Maria Silva",
		},
		scholar: {
			name: "João Carlos",
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
			name: "Lucas Almeida",
		},
		scholar: {
			name: "Ana Paula",
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
			name: "Fernanda Lima",
		},
		scholar: {
			name: "Bruno Costa",
		},
		time: "11h15",
	},
] as const;

export function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}
