import type { Metadata } from "next";

import { Frown } from "lucide-react";

import { ComboboxMultiple } from "@/components/combobox-multiple";
import { DatePickerWithRange } from "@/components/date-range-picker";
import {
	ServiceDetailsSidebar,
	ServiceDetailsTrigger,
} from "@/components/details";
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

import {
	formatDurationShort,
	getCurrentMonthRange,
	type ManagerRequest,
	mapRequestToServiceEntry,
} from "@/lib/dashboard-data";
import { withServerTRPC } from "@/lib/trpc-server";
import { cn, getInitials } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Atendimentos",
};

type MetricsSummary = {
	totalRequests: number;
	avgDurationSeconds: number | null;
	unattendedRequests: number;
};

type PersonOption = {
	user: {
		id: string;
		name: string;
	};
};

type ScholarDashboardResponse = {
	scholars: PersonOption[];
};

type StudentDashboardResponse = {
	students: PersonOption[];
};

export default async function ServicesPage() {
	const currentDate = new Date();
	const monthRange = getCurrentMonthRange();
	const [summary, requests, scholarsDashboard, studentsDashboard] =
		(await withServerTRPC(async (trpc) =>
			Promise.all([
				trpc.metrics.summary(monthRange),
				trpc.requests.managerList({ limit: 200 }),
				trpc.profiles.scholarDashboard(),
				trpc.profiles.studentDashboard(),
			]),
		)) as [
			MetricsSummary,
			ManagerRequest[],
			ScholarDashboardResponse,
			StudentDashboardResponse,
		];
	const serviceEntries = requests.map(mapRequestToServiceEntry);
	const dashboardCards: Array<{
		title: string;
		value: string;
		variant?: "default" | "destructive";
	}> = [
		{
			title: "Total no mês",
			value: String(summary.totalRequests),
		},
		{
			title: "Tempo médio",
			value: formatDurationShort(summary.avgDurationSeconds),
		},
		{
			title: "Não atendidos",
			value: String(summary.unattendedRequests),
			variant: "destructive",
		},
	];

	return (
		<>
			<section className="min-w-0 flex-1">
				<header className="flex flex-row items-center justify-between border-b border-border bg-card p-4 md:p-6">
					<div className="flex flex-col gap-1">
						<h1 className="text-base font-semibold">
							Atendimentos
						</h1>
						<h2 className="text-sm text-muted-foreground">
							{currentDate.toLocaleDateString("pt-BR", {
								month: "long",
								year: "numeric",
							})}
						</h2>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<Badge
							variant="success"
							className="hidden py-3 md:flex"
						>
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
						<Card key={title} className="group w-full gap-2">
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

				<div className="flex min-w-0 flex-col gap-4 overflow-hidden py-4 md:py-6">
					<div className="flex min-w-0 w-full flex-col items-center justify-start gap-4 px-4 md:px-6 md:flex-row">
						<DatePickerWithRange className="w-full md:w-fit md:flex-1" />
						<ComboboxMultiple
							className="w-full flex-1 md:w-fit md:flex-1"
							items={scholarsDashboard.scholars.map(
								(scholar) => ({
									id: scholar.user.id,
									label: scholar.user.name,
								}),
							)}
							allLabel="Todos os bolsistas"
						/>
						<ComboboxMultiple
							className="w-full flex-1 md:w-fit md:flex-1"
							items={studentsDashboard.students.map(
								(student) => ({
									id: student.user.id,
									label: student.user.name,
								}),
							)}
							allLabel="Todos os alunos"
						/>
					</div>
					<div className="w-full min-w-0 overflow-x-auto pl-4 md:pl-6 no-scrollbar">
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
								className="mr-4 md:mr-6"
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
									<TableHead className="pl-6 md:pl-8">
										Data
									</TableHead>
									<TableHead>Horário</TableHead>
									<TableHead>Bolsista</TableHead>
									<TableHead>Aluno</TableHead>
									<TableHead className="pr-6 md:pr-8 text-right">
										Ações
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{serviceEntries.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell className="pl-6 md:pl-8 font-medium">
											{entry.date}
										</TableCell>
										<TableCell>{entry.time}</TableCell>
										<TableCell>
											{entry.scholar ? (
												<div className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarFallback>
															{getInitials(
																entry.scholar
																	.user.name,
															)}
														</AvatarFallback>
													</Avatar>
													<span className="font-medium">
														{
															entry.scholar.user
																.name
														}
													</span>
												</div>
											) : (
												<span className="text-muted-foreground">
													Aguardando aceite
												</span>
											)}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarFallback>
														{getInitials(
															entry.student.user
																.name,
														)}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">
													{entry.student.user.name}
												</span>
											</div>
										</TableCell>
										<TableCell className="pr-6 md:pr-8 text-right">
											<ServiceDetailsTrigger
												entry={entry}
											>
												Ver
											</ServiceDetailsTrigger>
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
			</section>
			<ServiceDetailsSidebar />
		</>
	);
}
