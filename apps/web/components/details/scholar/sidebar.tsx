"use client";

import { DetailsSidebar } from "@/components/details/details-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { VerticalBarsChart } from "@/components/vertical-bars-chart";

import type { CachedScholar } from "@/lib/cached-data";
import { getInitials } from "@/lib/utils";

import { MutateScholarDialog } from "@/app/(dashboard)/bolsistas/dialog/add-scholar";

import { DetailsSection } from "../../section";
import { closeScholarDetails, useScholarDetailsEntry } from "./store";

const chartConfig = {
	value: {
		label: "Atendimentos",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const STATUS_LABEL: Record<CachedScholar["status"], string> = {
	available: "Disponível",
	busy: "Em atendimento",
	pending: "Pendente",
};

const STATUS_VARIANT: Record<
	CachedScholar["status"],
	"success" | "warning" | "destructive" | "secondary"
> = {
	available: "success",
	busy: "warning",
	pending: "secondary",
};

function ScholarDetailsContent({ scholar }: { scholar: CachedScholar }) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3 flex-row w-full">
				<Card size="sm" className="flex-1 bg-muted">
					<CardHeader className="space-y-2">
						<CardTitle className="font-normal">
							Atendimentos
						</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{scholar.summary.servicesAmount}
					</CardContent>
				</Card>

				<Card size="sm" className="flex-1 bg-muted">
					<CardHeader className="space-y-2">
						<CardTitle className="font-normal">
							Horas no mês
						</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{Math.round(
							scholar.summary.monthDurationSeconds / 3600,
						)}
					</CardContent>
				</Card>
			</div>

			{scholar.summary.servicesPerWeek.length > 0 && (
				<DetailsSection label="Atendimentos por semana">
					<VerticalBarsChart
						data={scholar.summary.servicesPerWeek.map(
							(week, index) => ({
								label: `S${index + 1}`,
								value: week.amount,
							}),
						)}
						config={chartConfig}
						className="h-32"
					/>
				</DetailsSection>
			)}

			{scholar.summary.frequentStudents.length > 0 && (
				<DetailsSection label="Alunos atendidos">
					{scholar.summary.frequentStudents.map((student) => (
						<div
							key={student.name}
							className="flex items-center justify-between gap-3"
						>
							<div className="flex flex-row items-center gap-3">
								<Avatar className="h-6 w-6">
									<AvatarFallback className="text-[8px]">
										{getInitials(student.name)}
									</AvatarFallback>
								</Avatar>
								<span className="text-sm">{student.name}</span>
							</div>
							<span className="text-sm text-muted-foreground">
								{student.amount}x
							</span>
						</div>
					))}
				</DetailsSection>
			)}

			{scholar.summary.frequentRoutes.length > 0 && (
				<DetailsSection label="Rotas mais frequentes">
					{scholar.summary.frequentRoutes.map((route) => (
						<div
							key={route.route}
							className="flex items-center justify-between gap-3 text-sm"
						>
							<span>{route.route}</span>
							<span className="text-muted-foreground">
								{route.amount}x
							</span>
						</div>
					))}
				</DetailsSection>
			)}

			<DetailsSection label="Informações">
				{[
					{
						title: "Matrícula",
						description: scholar.profile.enrollment,
					},
					{
						title: "Ativo desde",
						description: new Date(
							scholar.user.createdAt,
						).toLocaleDateString(),
					},
					{
						title: "Tempo médio",
						description: `${Math.round(scholar.summary.averageDurationSeconds / 60)} min / atend.`,
					},
				].map(({ title, description }) => (
					<div
						key={title}
						className="flex items-center justify-between gap-3 text-sm"
					>
						<span className="text-muted-foreground">{title}</span>
						<span>{description}</span>
					</div>
				))}
			</DetailsSection>

			<Separator />

			{/*<Button variant="outline" className="w-full" disabled>
				Ver histórico completo
			</Button>*/}
			<Button variant="destructive" className="w-[49%]">
				Desativar
			</Button>
			<div className="flex flex-row gap-2 justify-between">
				<MutateScholarDialog scholar={scholar}>
					<Button className="w-full">Editar bolsista</Button>
				</MutateScholarDialog>
			</div>
		</div>
	);
}

export function ScholarDetailsSidebar() {
	const selectedScholar = useScholarDetailsEntry();
	const scholar = selectedScholar.item;

	return (
		<DetailsSidebar
			open={selectedScholar.isOpen}
			header={
				scholar && (
					<div className="flex w-full justify-between gap-3 flex-col items-start">
						<div className="flex items-center gap-3 text-left">
							<Avatar className="h-10 w-10">
								<AvatarFallback>
									{getInitials(scholar.user.name)}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="font-medium">
									{scholar.user.name}
								</p>
								<p className="text-sm text-muted-foreground">
									{scholar.profile.course}
								</p>
							</div>
						</div>

						<Badge variant={STATUS_VARIANT[scholar.status]}>
							{STATUS_LABEL[scholar.status]}
						</Badge>
					</div>
				)
			}
			onClose={closeScholarDetails}
		>
			{scholar && <ScholarDetailsContent scholar={scholar} />}
		</DetailsSidebar>
	);
}
