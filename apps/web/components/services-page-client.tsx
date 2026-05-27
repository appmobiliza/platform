"use client";

import * as React from "react";

import { ExternalLink, Frown } from "lucide-react";

import { DatePickerWithRange } from "@/components/date-range-picker";
import { DetailsSidebar } from "@/components/details-sidebar";
import { StatusMessage } from "@/components/status-message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UserPicker } from "@/components/user-picker";

import { users } from "@/lib/mock";
import { cn } from "@/lib/utils";

type ServiceStatus = "concluded" | "in_progress" | "not_attended";

type ServiceEntry = {
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

const dashboardCards: Array<{
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

const serviceEntries: ServiceEntry[] = [
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

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function getStatusBadgeVariant(status: ServiceStatus) {
	if (status === "concluded") {
		return "success";
	}

	if (status === "in_progress") {
		return "warning";
	}

	return "destructive";
}

function getStatusLabel(status: ServiceStatus) {
	if (status === "concluded") {
		return "Finalizado";
	}

	if (status === "in_progress") {
		return "Em atendimento";
	}

	return "Não atendido";
}

function ServiceDetailsContent({ entry }: { entry: ServiceEntry }) {
	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader className="space-y-2">
					<div className="flex items-center justify-between gap-4">
						<CardTitle>Resumo</CardTitle>
						<Badge variant={getStatusBadgeVariant(entry.status)}>
							{getStatusLabel(entry.status)}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						{entry.route} • {entry.date} às {entry.time}
					</p>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Bolsista</span>
						<span className="font-medium">
							{entry.scholar.name}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Aluno</span>
						<span className="font-medium">
							{entry.student.name}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Duração</span>
						<span className="font-medium">{entry.duration}</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Observações</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm leading-6 text-muted-foreground">
						{entry.notes}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Participantes</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarFallback>
								{getInitials(entry.scholar.name)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="font-medium">{entry.scholar.name}</p>
							<p className="text-sm text-muted-foreground">
								Bolsista
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarFallback>
								{getInitials(entry.student.name)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="font-medium">{entry.student.name}</p>
							<p className="text-sm text-muted-foreground">
								Aluno
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function ServicesPageClient() {
	const currentDate = new Date();
	const [selectedEntry, setSelectedEntry] =
		React.useState<ServiceEntry | null>(null);

	return (
		<section className="flex min-h-0 min-w-0 flex-1 flex-col">
			<header className="flex flex-row items-center justify-between gap-4 border-b border-border bg-card p-4">
				<div className="flex flex-col gap-1">
					<h1 className="text-base font-semibold">Atendimentos</h1>
					<h2 className="text-sm text-muted-foreground">
						{currentDate.toLocaleDateString("pt-BR", {
							month: "long",
							year: "numeric",
						})}
					</h2>
				</div>
				<div className="flex flex-wrap items-center gap-4">
					<Badge variant="success" className="hidden py-3 md:flex">
						<span className="mr-1 h-2 w-2 rounded-full bg-success" />
						Sistema ativo
					</Badge>
					<Button variant="outline" className="gap-2">
						Exportar CSV
					</Button>
				</div>
			</header>

			<div className="grid grid-cols-1 gap-4 border-b border-border p-4 md:grid-cols-3 md:p-6">
				{dashboardCards.map(({ title, value, variant }) => (
					<Card
						key={title}
						className="group w-full gap-2"
						data-size="sm"
					>
						<CardHeader>
							<CardTitle>{title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p
								className={cn(
									"text-4xl font-bold",
									variant === "destructive" &&
										"text-destructive",
								)}
							>
								{value}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
				<div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
					<div className="flex min-w-0 flex-col items-center justify-start gap-4 md:flex-row">
						<DatePickerWithRange className="w-full md:w-fit md:flex-1" />
						<UserPicker
							className="w-full flex-1 md:w-fit md:flex-1"
							users={users
								.filter((user) => user.role === "scholar")
								.map((scholar) => ({
									id: scholar.id,
									name: scholar.name,
								}))}
							allLabel="Todos os bolsistas"
						/>
						<UserPicker
							className="w-full flex-1 md:w-fit md:flex-1"
							users={users
								.filter((user) => user.role === "student")
								.map((student) => ({
									id: student.id,
									name: student.name,
								}))}
							allLabel="Todos os alunos"
						/>
					</div>

					<div className="w-full min-w-0 overflow-x-auto no-scrollbar">
						<ToggleGroup
							type="single"
							size="sm"
							className="w-full min-w-max"
							defaultValue="all"
							variant="default"
						>
							<ToggleGroupItem
								value="all"
								aria-label="Exibir todos"
							>
								Todos
							</ToggleGroupItem>
							<ToggleGroupItem
								value="concluded"
								aria-label="Exibir concluídos"
							>
								Concluídos
							</ToggleGroupItem>
							<ToggleGroupItem
								value="in_progress"
								aria-label="Exibir em andamento"
							>
								Em andamento
							</ToggleGroupItem>
							<ToggleGroupItem
								className="mr-4"
								value="not_attended"
								aria-label="Exibir não atendidos"
							>
								Não atendidos
							</ToggleGroupItem>
						</ToggleGroup>
					</div>

					{serviceEntries.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="pl-6">Data</TableHead>
									<TableHead>Horário</TableHead>
									<TableHead>Bolsista</TableHead>
									<TableHead>Aluno</TableHead>
									<TableHead className="pr-6 text-right">
										Ações
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{serviceEntries.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell className="pl-6 font-medium">
											{entry.date}
										</TableCell>
										<TableCell>{entry.time}</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarFallback>
														{getInitials(
															entry.scholar.name,
														)}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">
													{entry.scholar.name}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarFallback>
														{getInitials(
															entry.student.name,
														)}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">
													{entry.student.name}
												</span>
											</div>
										</TableCell>
										<TableCell className="pr-6 text-right">
											<Button
												variant="outline"
												size="sm"
												className="gap-2"
												onClick={() =>
													setSelectedEntry(entry)
												}
											>
												Visualizar
												<ExternalLink className="size-3" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<StatusMessage
							className="my-48"
							title="Nenhum atendimento encontrado"
							description="Ajuste os filtros para encontrar atendimentos ou aguarde por novos registros."
							icon={<Frown className="size-8" />}
						/>
					)}
				</div>

				<DetailsSidebar
					open={selectedEntry !== null}
					title="Detalhes do atendimento"
					description={
						selectedEntry
							? `${selectedEntry.date} às ${selectedEntry.time}`
							: undefined
					}
					onClose={() => setSelectedEntry(null)}
				>
					{selectedEntry ? (
						<ServiceDetailsContent entry={selectedEntry} />
					) : null}
				</DetailsSidebar>
			</div>
		</section>
	);
}
