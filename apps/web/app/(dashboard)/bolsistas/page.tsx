import {
	type ScholarShiftValues,
	scholarShiftLabels,
} from "@mobiliza/contracts";

import { Frown, Plus, Search, XIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ScholarDetailsSidebar } from "@/components/details";
import { ScholarCard } from "@/components/scholar-card";
import { StatusMessage } from "@/components/status-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { getCachedScholarDashboard } from "@/lib/cached-data";
import { cn, getInitials } from "@/lib/utils";

import { MutateScholarDialog } from "./dialog/add-scholar";

export const metadata: Metadata = {
	title: "Bolsistas",
};

type StatusFilter = "all" | "available" | "busy" | "off_shift" | "pending";

function getFirstValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function normalizeStatus(value: string | string[] | undefined): StatusFilter {
	const status = getFirstValue(value);

	if (
		status === "available" ||
		status === "busy" ||
		status === "off_shift" ||
		status === "pending"
	) {
		return status;
	}

	return "all";
}

function buildFilterHref(query: string, status: StatusFilter) {
	const params = new URLSearchParams();

	if (query) {
		params.set("q", query);
	}

	if (status !== "all") {
		params.set("status", status);
	}

	const queryString = params.toString();

	return queryString ? `/bolsistas?${queryString}` : "/bolsistas";
}

export default async function ScholarsPage({
	searchParams,
}: Readonly<{
	searchParams: Promise<{
		q?: string | string[];
		status?: string | string[];
	}>;
}>) {
	const resolvedSearchParams = await searchParams;
	const query = getFirstValue(resolvedSearchParams.q)?.trim() ?? "";
	const statusFilter = normalizeStatus(resolvedSearchParams.status);
	const dashboard = await getCachedScholarDashboard();
	const normalizedQuery = query.toLowerCase();
	const filteredScholars = dashboard.scholars.filter((item) => {
		if (statusFilter !== "all" && item.status !== statusFilter) {
			return false;
		}

		if (!normalizedQuery) {
			return true;
		}

		return [
			item.user.name,
			item.profile.enrollment,
			item.profile.course,
			item.profile.campus,
		].some((value) => value.toLowerCase().includes(normalizedQuery));
	});

	const hasFilters = Boolean(query) || statusFilter !== "all";
	const currentMonth = new Date().toLocaleDateString("pt-BR", {
		month: "long",
		year: "numeric",
	});

	return (
		<section className="min-w-0 flex-1">
			<header className="flex flex-col justify-between gap-4 border-b border-border bg-card p-4 md:flex-row md:items-center md:p-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-base font-semibold">Bolsistas</h1>
					<h2 className="text-sm text-muted-foreground">
						{currentMonth}
					</h2>
				</div>
				<div className="flex flex-wrap items-center gap-4">
					<MutateScholarDialog>
						<Button size="lg" className="gap-2 px-3">
							<Plus className="size-4" />
							Adicionar bolsista
						</Button>
					</MutateScholarDialog>
				</div>
			</header>

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

			<div className="flex min-w-0 flex-col gap-4 overflow-hidden p-4 md:p-6">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
					<form
						action="/bolsistas"
						method="get"
						className="flex w-full flex-col gap-3 md:max-w-xl md:flex-row md:items-center"
					>
						<div className="relative w-full">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<div className="flex relative">
								<Input
									name="q"
									defaultValue={query}
									placeholder="Buscar por nome, matrícula, curso ou campus"
									className="pl-9"
								/>
								{/*{query ? (
									<Button
										asChild
										size="icon-sm"
										variant="ghost"
									>
										<Link
											className="absolute right-3 top-1/2 size-4 -translate-y-1/2"
											href="/bolsistas"
										>
											<XIcon className="size-4" />
										</Link>
									</Button>
								) : null}*/}
							</div>
						</div>
						{statusFilter !== "all" ? (
							<input
								type="hidden"
								name="status"
								value={statusFilter}
							/>
						) : null}
					</form>

					<div className="flex flex-wrap gap-2">
						{[
							{ label: "Todos", value: "all" as const },
							{
								label: "Disponíveis",
								value: "available" as const,
							},
							{ label: "Em atendimento", value: "busy" as const },
							{
								label: "Fora do turno",
								value: "off_shift" as const,
							},
						].map((item) => {
							const active = statusFilter === item.value;

							return (
								<Button
									key={item.value}
									asChild
									size="sm"
									variant={active ? "default" : "outline"}
								>
									<Link
										href={buildFilterHref(
											query,
											item.value,
										)}
									>
										{item.label}
									</Link>
								</Button>
							);
						})}
					</div>
				</div>

				{filteredScholars.length > 0 ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{filteredScholars.map((scholar) => (
							<ScholarCard
								key={scholar.user.id}
								scholar={scholar}
							/>
						))}
					</div>
				) : (
					<StatusMessage
						className="my-48 lg:max-w-2/3 mx-auto"
						title="Nenhum bolsista encontrado"
						description="Ajuste a busca ou os filtros na URL para encontrar bolsistas ou aguarde por novos registros."
						icon={<Frown className="size-8" />}
					/>
				)}
			</div>

			<ScholarDetailsSidebar />
		</section>
	);
}
