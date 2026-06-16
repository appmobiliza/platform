import { Plus } from "lucide-react";
import type { Metadata } from "next";

import { ScholarDetailsSidebar } from "@/components/details";
import { ScholarsListClient } from "@/components/scholar/scholars-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getCachedScholarDashboard } from "@/lib/cached-data";

import { MutateScholarDialog } from "./dialog/mutate-scholar";
import { ViewScheduleDialog } from "./dialog/view-schedule";

export const metadata: Metadata = {
	title: "Bolsistas",
};

export default async function ScholarsPage() {
	const dashboard = await getCachedScholarDashboard();

	const currentMonth = new Date().toLocaleDateString("pt-BR", {
		month: "long",
		year: "numeric",
	});

	return (
		<>
			<section className="min-w-0 flex-1">
				<header className="flex flex-col justify-between gap-4 border-b border-border bg-card p-4 md:flex-row md:items-center md:p-6">
					<div className="flex flex-col gap-1">
						<h1 className="text-base font-semibold">Bolsistas</h1>
						<h2 className="text-sm text-muted-foreground">
							{currentMonth}
						</h2>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<ViewScheduleDialog>
							<Button
								size="lg"
								className="gap-2 px-3"
								variant="outline"
							>
								Ver grade
							</Button>
						</ViewScheduleDialog>
						<MutateScholarDialog>
							<Button size="lg" className="gap-2 px-3">
								<Plus className="size-4" />
								Adicionar bolsista
							</Button>
						</MutateScholarDialog>
					</div>
				</header>

				{/* Cards de resumo */}
				<div className="grid grid-cols-1 gap-4 border-b border-border p-4 md:grid-cols-3 md:p-6">
					<Card className="group w-full gap-2">
						<CardHeader>
							<CardTitle>Total de bolsistas</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-4xl font-bold text-foreground">
								{dashboard.totalScholars}
							</p>
						</CardContent>
					</Card>
					<Card className="group w-full gap-2">
						<CardHeader>
							<CardTitle>Disponível agora</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-4xl font-bold text-success">
								{dashboard.availableNow}
							</p>
						</CardContent>
					</Card>
					<Card className="group w-full gap-2">
						<CardHeader>
							<CardTitle>Em atendimento</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-4xl font-bold text-yellow-500">
								{dashboard.inAttendance}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Filtros e listagem (cliente) */}
				<div className="flex min-w-0 flex-col gap-4 overflow-hidden p-4 md:p-6">
					<ScholarsListClient initialData={dashboard} />
				</div>
			</section>
			<ScholarDetailsSidebar />
		</>
	);
}
