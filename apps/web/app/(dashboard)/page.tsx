import {
	type ScholarShiftValues,
	scholarShiftLabels,
} from "@mobiliza/contracts";

import { Activity, Clock, Hourglass, TriangleAlert, Users } from "lucide-react";
import type { Metadata } from "next";

import { HorizontalBarsChart } from "@/components/horizontal-bars-chart";
import { RoutePreview } from "@/components/route-preview";
import { StatusMessage } from "@/components/status-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";

import { requireManagerAuth } from "@/lib/auth";
import {
	type CachedManagerRequest,
	getCachedManagerList,
	getCachedScholarDashboard,
	getCachedSummary,
} from "@/lib/cached-data";
import {
	countBy,
	formatDurationShort,
	getRouteLabel,
	getTodayRange,
	mapRequestToServiceEntry,
	toDate,
} from "@/lib/dashboard-data";
import { cn, getInitials } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Visão Geral",
};

const chartConfig = {
	value: {
		label: "Horário",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

function getScholarStatusLabel(
	status: "available" | "busy" | "off_shift" | "pending",
) {
	switch (status) {
		case "available":
			return "Disponível";
		case "busy":
			return "Em atendimento";
		case "off_shift":
			return "Fora do turno";
		case "pending":
			return "Pendente";
	}
}

function getScholarBadgeVariant(
	status: "available" | "busy" | "off_shift" | "pending",
) {
	if (status === "available") {
		return "success";
	}

	if (status === "busy") {
		return "warning";
	}

	if (status === "off_shift") {
		return "outline";
	}

	return "secondary";
}

function getHourlyChartData(requests: CachedManagerRequest[]) {
	const counts = new Map<string, number>();

	for (const request of requests) {
		const hour = toDate(request.createdAt)
			.getHours()
			.toString()
			.padStart(2, "0");
		counts.set(hour, (counts.get(hour) ?? 0) + 1);
	}

	return ["07", "08", "09", "10", "11", "12"].map((label) => ({
		label,
		value: counts.get(label) ?? 0,
	}));
}

function getPendingAlert(requests: CachedManagerRequest[]) {
	const pending = requests
		.filter((request) => request.status === "pending")
		.sort(
			(requestA, requestB) =>
				toDate(requestA.createdAt).getTime() -
				toDate(requestB.createdAt).getTime(),
		)[0];

	if (!pending) {
		return null;
	}

	return {
		delay: Math.max(
			1,
			Math.floor(
				(Date.now() - toDate(pending.createdAt).getTime()) / 60_000,
			),
		),
		name: pending.studentProfile.user.name,
	};
}

export default async function DashboardPage() {
	await requireManagerAuth();

	const todayRange = getTodayRange();
	const [summary, scholarDashboard, requests] = await Promise.all([
		getCachedSummary(todayRange.from, todayRange.to),
		getCachedScholarDashboard(),
		getCachedManagerList(100),
	]);
	const inProgressCount = requests.filter(
		(request) =>
			request.status === "accepted" || request.status === "ongoing",
	).length;
	const availableScholars = scholarDashboard.scholars.filter(
		(scholar) => scholar.status === "available",
	).length;
	const alertData = getPendingAlert(requests);
	const getRouteLabelForCached = (req: CachedManagerRequest) =>
		getRouteLabel(req as unknown as Parameters<typeof getRouteLabel>[0]);
	const mostRequestedRoutes = countBy(requests, getRouteLabelForCached)
		.slice(0, 4)
		.map((item) => ({ route: item.name, requests: item.count }));
	const lastRequests = requests
		.slice(0, 6)
		.map((req) =>
			mapRequestToServiceEntry(
				req as unknown as Parameters<
					typeof mapRequestToServiceEntry
				>[0],
			),
		);
	const currentDate = new Date();
	const dashboardCards: Array<{
		icon: typeof Users;
		title: string;
		value: string;
		footer: string;
		valueSuffix?: string;
	}> = [
		{
			icon: Users,
			title: "Atendimentos hoje",
			value: String(summary.totalRequests),
			footer: "registrados no período",
		},
		{
			icon: Clock,
			title: "Em andamento agora",
			value: String(inProgressCount),
			footer: "solicitações aceitas ou iniciadas",
		},
		{
			icon: Hourglass,
			title: "Tempo médio",
			value: formatDurationShort(summary.avgDurationSeconds),
			footer: "atendimentos concluídos",
		},
		{
			icon: Activity,
			title: "Bolsistas disponíveis",
			value: String(availableScholars),
			valueSuffix: `/ ${scholarDashboard.scholars.length}`,
			footer: "no turno atual",
		},
	];

	return (
		<section className="min-w-0 flex-1">
			<header className="border-b border-border p-4 md:p-6 flex flex-col items-start gap-1 justify-between bg-card">
				<h1 className="text-base font-semibold">Visão Geral</h1>
				<h2 className="text-sm text-muted-foreground">
					{currentDate.toLocaleDateString("pt-BR", {
						weekday: "long",
						day: "2-digit",
						month: "long",
						year: "numeric",
					})}
				</h2>
			</header>
			<div className="p-4 flex flex-col gap-4 md:p-6">
				{alertData ? (
					<Alert variant={"warning"}>
						<TriangleAlert className="h-4 w-4" />
						<AlertTitle>Alerta de espera</AlertTitle>
						<AlertDescription>
							A solicitação de {alertData.name} aguarda resposta
							há {alertData.delay} min. Nenhum bolsista aceitou
							ainda.
						</AlertDescription>
					</Alert>
				) : null}

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{dashboardCards.map(
						({ icon: Icon, title, value, valueSuffix, footer }) => (
							<Card key={title} className="group gap-2">
								<CardHeader>
									<CardAction>
										<Icon className="mt-1 h-4 w-4 text-muted-foreground" />
									</CardAction>
									<CardTitle>{title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-4xl font-bold">
										{value}
										{valueSuffix ? (
											<span className="text-lg font-normal text-muted-foreground">
												{" "}
												{valueSuffix}
											</span>
										) : null}
									</p>
								</CardContent>
								<CardFooter>
									<p className="text-sm text-muted-foreground">
										{footer}
									</p>
								</CardFooter>
							</Card>
						),
					)}
				</div>

				<div className="flex flex-col lg:flex-row items-stretch justify-start gap-4 w-full">
					<Card className="flex-1 w-full h-full">
						<CardHeader>
							<CardTitle>Status dos bolsistas</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="flex flex-col gap-3">
								{scholarDashboard.scholars.length > 0 ? (
									scholarDashboard.scholars
										.slice(0, 5)
										.map((scholar) => (
											<li
												key={scholar.user.id}
												className="flex items-center flex-row justify-between gap-2 text-sm w-full"
											>
												<div className="flex items-start justify-center flex-row gap-3">
													<Avatar className="h-10 w-10">
														<AvatarImage
															src={
																scholar.user
																	.image ||
																undefined
															}
															alt={
																scholar.user
																	.name
															}
														/>
														<AvatarFallback>
															{getInitials(
																scholar.user
																	.name,
															)}
														</AvatarFallback>
													</Avatar>
													<div className="flex flex-col items-start justify-start gap-2">
														<span className="font-semibold">
															{scholar.user.name}
														</span>
														<span className="text-xs">
															{
																scholarShiftLabels[
																	scholar
																		.profile
																		.shift as ScholarShiftValues
																]
															}{" "}
															·{" "}
															{
																scholar.profile
																	.course
															}
														</span>
													</div>
												</div>
												<Badge
													className="border-none"
													variant={getScholarBadgeVariant(
														scholar.status,
													)}
												>
													{getScholarStatusLabel(
														scholar.status,
													)}
												</Badge>
											</li>
										))
								) : (
									<div className="flex items-center justify-center h-full">
										<StatusMessage
											className="max-w-1/2"
											title="Nenhum bolsista encontrado."
											description="Os status dos bolsistas serão exibidos aqui assim que houver registros."
										/>
									</div>
								)}
							</ul>
						</CardContent>
					</Card>

					<Card className="flex-1 w-full">
						<CardHeader>
							<CardTitle>Demanda por horário — hoje</CardTitle>
						</CardHeader>
						<CardContent className="flex-1 min-h-0">
							{requests.length > 0 ? (
								<HorizontalBarsChart
									data={getHourlyChartData(requests)}
									config={chartConfig}
									className="h-70 lg:h-full"
								/>
							) : (
								<div className="flex items-center justify-center h-full">
									<StatusMessage
										className="max-w-1/2"
										title="Nenhuma solicitação registrada hoje."
										description="Os dados de demanda por horário serão exibidos aqui assim que houver solicitações."
									/>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<Card className="w-full">
					<CardHeader>
						<CardTitle>Rotas mais solicitadas</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 lg:gap-x-24 gap-y-2">
							{mostRequestedRoutes.length > 0 ? (
								mostRequestedRoutes.map((route) => (
									<li
										key={route.route}
										className="flex justify-between"
									>
										<span>{route.route}</span>
										<span className="text-muted-foreground">
											{route.requests}x
										</span>
									</li>
								))
							) : (
								<li className="text-sm text-muted-foreground">
									Nenhuma rota registrada.
								</li>
							)}
						</ul>
					</CardContent>
				</Card>

				{lastRequests.length > 0 ? (
					<Card className="p-0 gap-0">
						<CardHeader className="flex flex-row items-center justify-between bg-background px-6 pb-3 pt-6 md:bg-card border-b border-border">
							<CardTitle>Últimos atendimentos</CardTitle>
							<CardAction>
								<Button variant={"outline"} size={"xs"}>
									Ver todos
								</Button>
							</CardAction>
						</CardHeader>
						<CardContent className="p-0 md:p-4 md:bg-background">
							<ul className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 md:gap-4">
								{lastRequests.map((entry) => {
									const isDuring =
										entry.status === "in_progress";

									return (
										<li
											key={entry.id}
											className="flex flex-col items-start justify-start w-full p-6 border-b gap-4 border-border hover:bg-muted/25 transition-colors cursor-pointer bg-card md:rounded-lg md:border-none"
										>
											<div className="font-semibold flex flex-row items-start justify-between gap-4 w-full">
												<div className="flex items-start justify-start flex-row gap-3">
													<div
														className={cn(
															"h-2 w-2 mt-1.5 rounded-full",
															{
																"bg-green-500":
																	entry.status ===
																	"concluded",
																"bg-yellow-500 animate-pulse":
																	isDuring,
																"bg-destructive":
																	entry.status ===
																	"not_attended",
															},
														)}
													/>
													<div className="flex flex-col items-start justify-start gap-1">
														<span className="flex-wrap">
															{entry.scholar?.user
																.name ??
																"Aguardando bolsista"}{" "}
															→{" "}
															<br className="flex md:hidden" />{" "}
															{
																entry.student
																	.user.name
															}
														</span>
														<span className="text-xs font-normal text-muted-foreground">
															{entry.route} ·{" "}
															{entry.time} ·{" "}
															{entry.duration}
														</span>
													</div>
												</div>
												<Badge
													className="border-none"
													variant={
														entry.status ===
														"concluded"
															? "success"
															: entry.status ===
																	"in_progress"
																? "warning"
																: "destructive"
													}
												>
													{isDuring
														? "Em atendimento"
														: entry.status ===
																"concluded"
															? "Finalizado"
															: "Não atendido"}
												</Badge>
											</div>
											<RoutePreview />
										</li>
									);
								})}
							</ul>
						</CardContent>
					</Card>
				) : null}
			</div>
		</section>
	);
}
