import { Frown, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ScholarDetailsSidebar } from "@/components/details";
import { StatusMessage } from "@/components/status-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { withServerTRPC } from "@/lib/trpc-server";
import { cn, getInitials } from "@/lib/utils";

import { MutateScholarDialog } from "./dialog/add-scholar";

export const metadata: Metadata = {
	title: "Bolsistas",
};

type StatusFilter = "all" | "available" | "busy" | "off_shift" | "pending";

type ScholarDashboardCard = {
	title: string;
	value: string;
	variant?: "default" | "green" | "yellow";
};

type ScholarDashboardItem = {
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null | undefined;
		role: string;
	};
	profile: {
		id: string;
		userId: string;
		enrollment: string;
		course: string;
		campus: string;
		phone: string;
		shift: string;
		isAvailable: boolean;
		isActive: boolean;
	};
	status: Exclude<StatusFilter, "all">;
	statusLabel: string;
	shiftLabel: string;
};

type ScholarDashboardResponse = {
	cards: ScholarDashboardCard[];
	scholars: ScholarDashboardItem[];
};

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
	const dashboard = (await withServerTRPC((trpc) =>
		trpc.profiles.scholarDashboard(),
	)) as ScholarDashboardResponse;
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
				{dashboard.cards.map(({ title, value, variant }) => (
					<Card key={title} className="group w-full gap-2">
						<CardHeader>
							<CardTitle>{title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p
								className={cn(
									"text-4xl font-bold",
									variant === "green"
										? "text-success"
										: variant === "yellow"
											? "text-yellow-500"
											: "text-foreground",
								)}
							>
								{value}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="flex min-w-0 flex-col gap-4 overflow-hidden p-4 md:p-6">
				<div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row md:items-end md:justify-between">
					<form
						action="/bolsistas"
						method="get"
						className="flex w-full flex-col gap-3 md:max-w-xl md:flex-row md:items-center"
					>
						<div className="relative w-full">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								name="q"
								defaultValue={query}
								placeholder="Buscar por nome, matrícula, curso ou campus"
								className="pl-9"
							/>
						</div>
						{statusFilter !== "all" ? (
							<input
								type="hidden"
								name="status"
								value={statusFilter}
							/>
						) : null}
						<Button
							type="submit"
							variant="outline"
							className="gap-2"
						>
							Filtrar
						</Button>
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
							{ label: "Pendentes", value: "pending" as const },
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
						{hasFilters ? (
							<Button asChild size="sm" variant="ghost">
								<Link href="/bolsistas">Limpar</Link>
							</Button>
						) : null}
					</div>
				</div>

				{filteredScholars.length > 0 ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{filteredScholars.map((scholar) => (
							<Card
								key={scholar.user.id}
								className={cn(
									"gap-4 border-border/80 bg-card/95 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md",
									scholar.status === "available" &&
										"ring-1 ring-success/20",
									scholar.status === "busy" &&
										"ring-1 ring-warning/20",
									scholar.status === "off_shift" &&
										"ring-1 ring-destructive/20",
								)}
							>
								<CardHeader className="space-y-4">
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-start gap-3">
											<Avatar className="size-12 border border-border">
												<AvatarFallback>
													{getInitials(
														scholar.user.name,
													)}
												</AvatarFallback>
												<AvatarImage
													src={
														scholar.user.image ||
														undefined
													}
													alt={scholar.user.name}
												/>
											</Avatar>
											<div className="space-y-1">
												<CardTitle className="text-lg">
													{scholar.user.name}
												</CardTitle>
												<p className="text-sm text-muted-foreground">
													{scholar.shiftLabel} ·{" "}
													{scholar.profile.course}
												</p>
												<p className="text-xs text-muted-foreground">
													{scholar.profile.campus}
												</p>
											</div>
										</div>
										<Badge
											variant={
												scholar.status === "available"
													? "success"
													: scholar.status === "busy"
														? "warning"
														: scholar.status ===
																"off_shift"
															? "destructive"
															: "secondary"
											}
										>
											{scholar.statusLabel}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground">
										Matrícula {scholar.profile.enrollment}
									</p>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-3 text-sm">
										<div className="rounded-md border bg-muted/40 p-3">
											<p className="text-xs text-muted-foreground">
												Telefone
											</p>
											<p className="font-medium">
												{scholar.profile.phone}
											</p>
										</div>
										<div className="rounded-md border bg-muted/40 p-3">
											<p className="text-xs text-muted-foreground">
												Situação
											</p>
											<p className="font-medium">
												{scholar.profile.isActive
													? "Ativo"
													: "Inativo"}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<StatusMessage
						className="my-48"
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
