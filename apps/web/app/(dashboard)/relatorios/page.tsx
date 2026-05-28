import type { Metadata } from "next";
import type { ReactNode } from "react";

import { FileDown, FileSpreadsheet, InfoIcon } from "lucide-react";

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

import { getInitials } from "@/lib/utils";

const reportMonth = new Date().toLocaleDateString("pt-BR", {
	month: "long",
	year: "numeric",
});

const studentOptions = [
	"João Pedro",
	"Ana Beatriz",
	"Carlos Eduardo",
	"Fernanda Santos",
];

const scholarOptions = [
	"Lucas Carvalho",
	"Maria Costa",
	"Rafael Souza",
	"Juliana Oliveira",
];

const shiftOptions = ["Matutino", "Vespertino", "Noturno"];

const stats = [
	{
		title: "Total de atendimentos",
		value: "94",
		caption: "+18% vs março",
		valueClassName: "text-foreground",
	},
	{
		title: "Tempo médio de espera",
		value: "4 min",
		caption: "do pedido ao aceite",
		valueClassName: "text-foreground",
	},
	{
		title: "Tempo médio de atendimento",
		value: "14",
		caption: "por deslocamento",
		valueClassName: "text-foreground",
	},
	{
		title: "Taxa de conclusão",
		value: "97%",
		caption: "3 não atendidos",
		valueClassName: "text-success",
	},
	{
		title: "Alunos atendidos",
		value: "9",
		caption: "de 9 cadastrados",
		valueClassName: "text-foreground",
	},
] as const;

const weekdayProgress = [
	{ label: "Seg", value: 24, percent: 44 },
	{ label: "Ter", value: 18, percent: 12 },
	{ label: "Qua", value: 11, percent: 16 },
	{ label: "Qui", value: 54, percent: 24 },
	{ label: "Sex", value: 31, percent: 4 },
] as const;

const shiftProgress = [
	{ label: "Matutino", value: 52, percent: 55 },
	{ label: "Vespertino", value: 18, percent: 19 },
	{ label: "Noturno", value: 24, percent: 26 },
] as const;

const hourlyChartData = [
	{ label: "08h", value: 2 },
	{ label: "09h", value: 5 },
	{ label: "10h", value: 7 },
	{ label: "11h", value: 6 },
	{ label: "12h", value: 3 },
	{ label: "13h", value: 2 },
	{ label: "14h", value: 4 },
	{ label: "15h", value: 7 },
	{ label: "16h", value: 5 },
	{ label: "17h", value: 2 },
	{ label: "18h", value: 3 },
	{ label: "19h", value: 1 },
] as const;

const hourlyChartConfig = {
	value: {
		label: "Atendimentos",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const scholarRanking = [
	{ name: "Lucas C.", count: 23 },
	{ name: "Beatriz F.", count: 18 },
	{ name: "Rafael S.", count: 15 },
	{ name: "Thais M.", count: 13 },
	{ name: "Pedro L.", count: 8 },
] as const;

const routeRanking = [
	{ name: "IC → RU", count: 12 },
	{ name: "Lanchonete → COS", count: 2 },
	{ name: "RU → Reitoria", count: 5 },
	{ name: "Bradesco → IQB", count: 3 },
	{ name: "FAED → Biblioteca", count: 8 },
] as const;

const studentRanking = [
	{ name: "Maria Aparecida", count: 37 },
	{ name: "Rodrigo Santos", count: 24 },
	{ name: "João Henrique", count: 19 },
	{ name: "Ana Clara", count: 17 },
	{ name: "Paulo Teixeira", count: 12 },
] as const;

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
								{item.value} ⋅ {item.percent}%
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
				{items.map((item, index) => (
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
				))}
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

export const metadata: Metadata = {
	title: "Relatórios",
};

export default function ReportsPage() {
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
						items={studentOptions.map((option) => ({
							id: option,
							label: option,
						}))}
						allLabel="Todos os alunos"
					/>

					<ComboboxMultiple
						items={scholarOptions.map((option) => ({
							id: option,
							label: option,
						}))}
						allLabel="Todos os bolsistas"
					/>

					<ComboboxMultiple
						items={shiftOptions.map((option) => ({
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
									Quinta-feira
								</strong>{" "}
								concentra o maior volume de solicitações no mês.
							</>
						}
					/>

					<ProgressSection
						title="Atendimentos por turno"
						items={shiftProgress}
						accentClassName="h-full rounded-full bg-[var(--chart-2)]"
						note="Matutino concentra a maior parte dos atendimentos registrados no mês analisado."
					/>
				</div>

				<SectionCard
					title={`Atendimentos por hora do dia — ${reportMonth.toLowerCase()}`}
				>
					<div className="space-y-4">
						<VerticalBarsChart
							data={hourlyChartData.map((item) => ({
								label: item.label,
								value: item.value,
							}))}
							config={hourlyChartConfig}
							className="h-44 md:h-52"
						/>
						<Alert variant={"info"}>
							<InfoIcon className="size-4" />
							Pico entre 10h e 16h, com queda consistente no fim
							da tarde.
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
