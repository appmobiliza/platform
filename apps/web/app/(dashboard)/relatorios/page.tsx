import { FileDown, FileSpreadsheet, InfoIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ComboboxMultiple } from "@/components/combobox-multiple";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { VerticalBarsChart } from "@/components/vertical-bars-chart";

import {
	type CachedManagerRequest,
	getCachedManagerList,
	getCachedScholarDashboard,
	getCachedScholarPerformance,
	getCachedStudentDashboard,
	getCachedSummary,
} from "@/lib/cached-data";
import {
	countBy,
	formatDurationShort,
	getCurrentMonthRange,
	getRouteLabel,
	toDate,
} from "@/lib/dashboard-data";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Relatórios",
};

const hourlyChartConfig = {
	value: {
		label: "Atendimentos",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const exportCards = [
	{
		title: "Relatório completo de atendimentos",
		description:
			"Todos os registros atendidos e não atendidos do mês, com filtros por aluno, bolsista e turno.",
	},
	{
		title: "Relatório por bolsista",
		description:
			"Resumo com volume de atendimentos, tempo médio e distribuição por turno para cada bolsista.",
	},
	{
		title: "Relatório por aluno",
		description:
			"Histórico consolidado de solicitações, rotas preferidas e atendimento por aluno cadastrado.",
	},
] as const;

const shiftLabels: Record<string, string> = {
	morning: "Matutino",
	afternoon: "Vespertino",
	night: "Noturno",
	full_day: "Integral",
};

function StatCard({
	title,
	value,
	caption,
	valueClassName,
}: {
	title: string;
	value: string;
	caption: string;
	valueClassName?: string;
}) {
	return (
		<Card className="gap-2 px-4 py-4 md:px-6">
			<p className="text-sm font-medium text-muted-foreground">{title}</p>
			<div className="space-y-1">
				<p
					className={[
						"text-2xl font-semibold tracking-[-0.03em] md:text-3xl",
						valueClassName,
					]
						.filter(Boolean)
						.join(" ")}
				>
					{value}
				</p>
				<p className="text-sm text-muted-foreground">{caption}</p>
			</div>
		</Card>
	);
}

function SectionCard({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<Card className="gap-4 p-4 md:p-6">
			<CardHeader className="space-y-1 p-0">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{description ? (
					<CardDescription>{description}</CardDescription>
				) : null}
			</CardHeader>
			<CardContent className="p-0">{children}</CardContent>
		</Card>
	);
}

function ProgressSection({
	title,
	items,
	note,
	accentClassName,
}: {
	title: string;
	items: ReadonlyArray<{ label: string; value: number; percent: number }>;
	note: ReactNode;
	accentClassName: string;
}) {
	return (
		<SectionCard title={title}>
			<div className="flex flex-col gap-3">
				{items.map((item) => (
					<div key={item.label} className="flex flex-col gap-2">
						<div className="flex items-center justify-between gap-3 text-sm font-medium">
							<span className="text-foreground">
								{item.label}
							</span>
							<span className="text-muted-foreground">
								{item.value} · {item.percent}%
							</span>
						</div>
						<div className="h-2.5 overflow-hidden rounded-full bg-muted/80">
							<div
								className={accentClassName}
								style={{ width: `${item.percent}%` }}
							/>
						</div>
					</div>
				))}
			</div>
			<p className="mt-4 text-xs leading-5 text-muted-foreground">
				{note}
			</p>
		</SectionCard>
	);
}

function RankingCard({
	title,
	items,
	prefix = "x",
	showUser = false,
}: {
	title: string;
	items: ReadonlyArray<{ name: string; count: number }>;
	prefix?: "x" | "atend.";
	showUser?: boolean;
}) {
	return (
		<SectionCard title={title}>
			<div className="flex flex-col gap-0">
				{items.length > 0 ? (
					items.map((item, index) => (
						<div
							key={item.name}
							className="flex items-center justify-between gap-3 border-b border-border/60 py-3 last:border-b-0 last:pb-0 first:pt-0"
						>
							<div className="flex min-w-0 items-center gap-3">
								{prefix === "x" ? null : (
									<p className="w-3 shrink-0 text-xs text-foreground/80">
										{index + 1}
									</p>
								)}
								{showUser && (
									<Avatar className="h-8 w-8 shrink-0">
										<AvatarFallback className="text-[10px]">
											{getInitials(item.name)}
										</AvatarFallback>
									</Avatar>
								)}
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">
										{item.name}
									</p>
								</div>
							</div>
							<Badge variant="secondary" className="shrink-0">
								{item.count} {prefix}
							</Badge>
						</div>
					))
				) : (
					<p className="text-sm text-muted-foreground">
						Sem registros no período.
					</p>
				)}
			</div>
		</SectionCard>
	);
}

function ExportCard({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<Card className="gap-4 p-4 flex md:flex-row">
			<CardHeader className="space-y-1 p-0 flex-1">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardFooter className="flex flex-wrap gap-2 p-0">
				<Button variant="outline" className="gap-2">
					<FileSpreadsheet className="size-4" />
					CSV
				</Button>
				<Button className="gap-2">
					<FileDown className="size-4" />
					PDF
				</Button>
			</CardFooter>
		</Card>
	);
}

function toProgressItems(items: Array<{ label: string; value: number }>) {
	const total = items.reduce((sum, item) => sum + item.value, 0);

	return items.map((item) => ({
		...item,
		percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
	}));
}

function getTopItem(items: ReadonlyArray<{ label: string; value: number }>) {
	return items.reduce((top, item) => (item.value > top.value ? item : top), {
		label: "Sem dados",
		value: 0,
	});
}

function getHourlyChartData(requests: CachedManagerRequest[]) {
	const counts = new Map<string, number>();

	for (const request of requests) {
		const label = `${toDate(request.createdAt).getHours().toString().padStart(2, "0")}h`;
		counts.set(label, (counts.get(label) ?? 0) + 1);
	}

	return [
		"08h",
		"09h",
		"10h",
		"11h",
		"12h",
		"13h",
		"14h",
		"15h",
		"16h",
		"17h",
		"18h",
		"19h",
	].map((label) => ({ label, value: counts.get(label) ?? 0 }));
}

export default async function ReportsPage() {
	const monthRange = getCurrentMonthRange();
	const [
		summary,
		scholarPerformance,
		requests,
		scholarDashboard,
		studentDashboard,
	] = await Promise.all([
		getCachedSummary(monthRange.from, monthRange.to),
		getCachedScholarPerformance(monthRange.from, monthRange.to),
		getCachedManagerList(500),
		getCachedScholarDashboard(),
		getCachedStudentDashboard(),
	]);
	const reportMonth = new Date().toLocaleDateString("pt-BR", {
		month: "long",
		year: "numeric",
	});
	const weekdayCounts = countBy(requests, (request) =>
		toDate(request.createdAt).toLocaleDateString("pt-BR", {
			weekday: "short",
		}),
	);
	const weekdayProgress = toProgressItems(
		["seg.", "ter.", "qua.", "qui.", "sex."].map((label) => ({
			label: label.replace(".", ""),
			value:
				weekdayCounts.find(
					(item) =>
						item.name.toLowerCase().replace(".", "") ===
						label.replace(".", ""),
				)?.count ?? 0,
		})),
	);
	const shiftProgress = toProgressItems(
		Object.entries(shiftLabels).map(([shift, label]) => ({
			label,
			value: requests.filter(
				(request) => request.studentProfile.shift === shift,
			).length,
		})),
	);
	const hourlyChartData = getHourlyChartData(requests);
	const peakHour = getTopItem(hourlyChartData);
	const topWeekday = getTopItem(weekdayProgress);
	const topShift = getTopItem(shiftProgress);
	const stats = [
		{
			title: "Total de atendimentos",
			value: String(summary.totalRequests),
			caption: `${summary.completedRequests} concluídos`,
			valueClassName: "text-foreground",
		},
		{
			title: "Tempo médio",
			value: formatDurationShort(summary.avgDurationSeconds),
			caption: "por deslocamento concluído",
			valueClassName: "text-foreground",
		},
		{
			title: "Não atendidos",
			value: String(summary.unattendedRequests),
			caption: `${summary.cancelledRequests} cancelados`,
			valueClassName: "text-foreground",
		},
		{
			title: "Taxa de conclusão",
			value: `${Math.round(summary.completionRate * 100)}%`,
			caption: "do período selecionado",
			valueClassName: "text-success",
		},
		{
			title: "Alunos atendidos",
			value: String(studentDashboard.students.length),
			caption: "cadastros no painel",
			valueClassName: "text-foreground",
		},
	];
	const scholarRanking = scholarPerformance.slice(0, 5).map((scholar) => ({
		name: scholar.scholarName,
		count: Number(scholar.totalAttendances),
	}));
	const routeRanking = countBy(requests, getRouteLabel).slice(0, 5);
	const studentRanking = countBy(
		requests,
		(request) => request.studentProfile.user.name,
	).slice(0, 5);

	return (
		<section className="min-w-0 flex-1">
			<header className="border-b border-border bg-card px-4 py-4 backdrop-blur md:px-6 md:py-5">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-1">
						<h1 className="text-base font-semibold">Relatórios</h1>
						<h2 className="text-sm text-muted-foreground">
							Campus A.C. Simões
						</h2>
					</div>

					<div className="flex items-center gap-3">
						<Badge
							variant="success"
							className="hidden py-2 md:inline-flex"
						>
							<span className="mr-1 h-2 w-2 rounded-full bg-success" />
							Dados atualizados
						</Badge>
						<Button className="gap-2 px-4">
							<FileDown className="size-4" />
							Exportar PDF
						</Button>
					</div>
				</div>
			</header>

			<div className="flex flex-col gap-4 p-4 md:p-6">
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
					<div className="md:col-span-2 xl:col-span-1">
						<DatePickerWithRange className="w-full bg-card" />
					</div>

					<ComboboxMultiple
						items={studentDashboard.students.map((student) => ({
							id: student.user.id,
							label: student.user.name,
						}))}
						allLabel="Todos os alunos"
					/>

					<ComboboxMultiple
						items={scholarDashboard.scholars.map((scholar) => ({
							id: scholar.user.id,
							label: scholar.user.name,
						}))}
						allLabel="Todos os bolsistas"
					/>

					<ComboboxMultiple
						items={Object.values(shiftLabels).map((option) => ({
							id: option,
							label: option,
						}))}
						allLabel="Todos os turnos"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
					{stats.map((stat) => (
						<StatCard key={stat.title} {...stat} />
					))}
				</div>

				<div className="grid gap-4 xl:grid-cols-2">
					<ProgressSection
						title="Atendimentos por dia da semana"
						items={weekdayProgress}
						accentClassName="h-full rounded-full bg-[var(--chart-1)]"
						note={
							<>
								<strong className="font-semibold text-foreground">
									{topWeekday.label}
								</strong>{" "}
								concentra o maior volume de solicitações no mês.
							</>
						}
					/>

					<ProgressSection
						title="Atendimentos por turno"
						items={shiftProgress}
						accentClassName="h-full rounded-full bg-[var(--chart-2)]"
						note={`${topShift.label} concentra a maior parte dos atendimentos registrados no mês analisado.`}
					/>
				</div>

				<SectionCard
					title={`Atendimentos por hora do dia — ${reportMonth.toLowerCase()}`}
				>
					<div className="space-y-4">
						<VerticalBarsChart
							data={hourlyChartData}
							config={hourlyChartConfig}
							className="h-44 md:h-52"
						/>
						<Alert variant={"info"}>
							<InfoIcon className="size-4" />
							{peakHour.value > 0
								? `Pico às ${peakHour.label}, com ${peakHour.value} solicitações no período.`
								: "Sem solicitações registradas no período."}
						</Alert>
					</div>
				</SectionCard>

				<div className="grid gap-4 xl:grid-cols-3">
					<RankingCard
						title="Ranking de bolsistas"
						items={scholarRanking}
						showUser
						prefix="atend."
					/>
					<RankingCard
						title="Rotas mais solicitadas"
						items={routeRanking}
					/>
					<RankingCard
						title="Alunos por frequência"
						items={studentRanking}
						showUser
						prefix="x"
					/>
				</div>

				<div className="space-y-3">
					<p className="text-sm font-medium text-foreground">
						Exportar relatório
					</p>
					<div className="space-y-4">
						{exportCards.map((card) => (
							<ExportCard
								key={card.title}
								title={card.title}
								description={card.description}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
