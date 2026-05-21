import {
	Activity,
	Clock,
	CloudLightning,
	TriangleAlert,
	Users,
} from "lucide-react";

import { HorizontalBarsChart } from "@/components/horizontal-bars-chart";
import { RoutePreview } from "@/components/route-preview";
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

import { cn } from "@/lib/utils";

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
		value: "7",
		footer: "+2 em relação a ontem",
	},
	{
		icon: CloudLightning,
		title: "Em andamento agora",
		value: "2",
		footer: "no turno atual",
	},
	{
		icon: Clock,
		title: "Tempo de espera",
		value: "~5m",
		footer: "+21% do último dia",
	},
	{
		icon: Activity,
		title: "Bolsistas disponíveis",
		value: "2",
		valueSuffix: "/ 5",
		footer: "no turno atual",
	},
] as const;

enum ScholarStatus {
	AVAILABLE = "Disponível",
	ATTENDING = "Em atendimento",
	OFFLINE = "Offline",
}

enum RequestStatus {
	ATTENDING = "Em atendimento",
	FINISHED = "Finalizado",
}

const scholars = [
	{
		name: "Lucas Carvalho",
		currentRouteStart: "IC",
		currentRouteEnd: "RU",
		status: ScholarStatus.ATTENDING,
	},
	{
		name: "Ana Silva",
		currentRouteStart: "IC",
		currentRouteEnd: "RU",
		status: ScholarStatus.ATTENDING,
	},
	{
		name: "Maria Costa",
		currentRouteStart: "IC",
		currentRouteEnd: "RU",
		status: ScholarStatus.AVAILABLE,
	},
	{
		name: "Rafael Souza",
		currentRouteStart: "IC",
		currentRouteEnd: "RU",
		status: ScholarStatus.AVAILABLE,
	},
	{
		name: "Pedro Lima",
		currentRouteStart: "IC",
		currentRouteEnd: "RU",
		status: ScholarStatus.OFFLINE,
	},
];

const alertData = {
	delay: 4,
	name: "Maria Aparecida",
};

const mostRequestedRoutes = [
	{ route: "IC → RU", requests: 15 },
	{ route: "IC → Biblioteca", requests: 10 },
	{ route: "RU → IC", requests: 8 },
	{ route: "Biblioteca → IC", requests: 5 },
];

const lastRequests = [
	{
		route: "IC → RU",
		startTime: "10:15",
		endTime: null,
		scholar: "Lucas Carvalho",
		student: "João Pedro",
		status: RequestStatus.ATTENDING,
	},
	{
		route: "IC → Biblioteca",
		startTime: "10:00",
		endTime: null,
		scholar: "Maria Costa",
		student: "Ana Beatriz",
		status: RequestStatus.ATTENDING,
	},
	{
		route: "RU → IC",
		startTime: "09:45",
		endTime: "10:05",
		scholar: "Rafael Souza",
		student: "Carlos Eduardo",
		status: RequestStatus.FINISHED,
	},
	{
		route: "Biblioteca → RU",
		startTime: "09:30",
		endTime: "09:50",
		scholar: "Juliana Oliveira",
		student: "Fernanda Santos",
		status: RequestStatus.FINISHED,
	},
	{
		route: "IC → RU",
		startTime: "09:15",
		endTime: "09:35",
		scholar: "Bruno Martinez",
		student: "Gustavo Ferreira",
		status: RequestStatus.FINISHED,
	},
];

const chartData = [
	{ label: "07", value: 2 },
	{ label: "08", value: 4 },
	{ label: "09", value: 3 },
	{ label: "10", value: 5 },
	{ label: "11", value: 4 },
	{ label: "12", value: 6 },
];

const chartConfig = {
	value: {
		label: "Horário",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export default function DashboardPage() {
	return (
		<section>
			<header className="border-b border-border p-4 flex flex-col items-start gap-1 justify-between bg-card">
				<h1 className="text-base font-semibold">Visão Geral</h1>
				<h2 className="text-sm text-muted-foreground">
					Sexta-feira, 24 de abril de 2026
				</h2>
			</header>
			<div className="p-4 flex flex-col gap-4">
				{alertData.delay > 0 && (
					<Alert variant={"warning"}>
						<TriangleAlert className="h-4 w-4" />
						<AlertTitle>Alerta de espera</AlertTitle>
						<AlertDescription>
							A solicitação de {alertData.name} aguarda resposta
							há {alertData.delay}
							min. Nenhum bolsista aceitou ainda.
						</AlertDescription>
					</Alert>
				)}
				{dashboardCards.map(
					({ icon: Icon, title, value, valueSuffix, footer }) => (
						<Card
							key={title}
							className="group gap-2"
							data-size="sm"
						>
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
				<Card>
					<CardHeader>
						<CardTitle>
							Status dos bolsistas — turno matutino
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="flex flex-col gap-3">
							{scholars.map(
								({
									name,
									currentRouteStart,
									currentRouteEnd,
									status,
								}) => (
									<li
										key={name}
										className="flex items-center flex-row justify-between gap-2 text-sm w-full"
									>
										<div className="flex items-start justify-center flex-row gap-3">
											<Avatar className="h-12 w-12">
												<AvatarImage
													src={"https://none.png"}
													alt={name}
												/>
												<AvatarFallback>
													{name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col items-start justify-start gap-2">
												<span className="font-semibold">
													{name}
												</span>
												<span className="text-xs">
													{currentRouteStart} →{" "}
													{currentRouteEnd}
												</span>
											</div>
										</div>
										<Badge
											className="border-none"
											variant={
												status ===
												ScholarStatus.AVAILABLE
													? "success"
													: status ===
															ScholarStatus.ATTENDING
														? "warning"
														: "destructive"
											}
										>
											{status === ScholarStatus.AVAILABLE
												? "Disponível"
												: status ===
														ScholarStatus.ATTENDING
													? "Em atendimento"
													: "Offline"}
										</Badge>
									</li>
								),
							)}
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Demanda por horário — semana</CardTitle>
					</CardHeader>
					<CardContent>
						<HorizontalBarsChart
							data={chartData}
							config={chartConfig}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Rotas mais solicitadas</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
							{mostRequestedRoutes.map((route, index) => (
								<li
									key={index}
									className="flex justify-between"
								>
									<span>{route.route}</span>
									<span className="text-muted-foreground">
										{route.requests}x
									</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Últimos atendimentos</CardTitle>
						<CardAction>
							<Button
								variant={"outline"}
								size={"xs"}
								className="bg-transparent dark:bg-transparent"
							>
								Ver todos
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent>
						<ul className="flex flex-col gap-6">
							{lastRequests.map(
								(
									{
										route,
										startTime,
										endTime,
										scholar,
										student,
										status,
									},
									index,
								) => (
									<li
										key={index}
										className="flex flex-col items-start justify-start gap-3 md:gap-4 w-full"
									>
										<div className="font-semibold flex flex-row items-start justify-between gap-4 w-full">
											<div className="flex items-start justify-start flex-row gap-3">
												<div
													className={cn(
														`h-2 w-2 mt-1.5 rounded-full`,
														{
															"bg-green-500":
																status ===
																RequestStatus.FINISHED,
															"bg-yellow-500 animate-pulse":
																status ===
																RequestStatus.ATTENDING,
														},
													)}
												/>
												<div className="flex flex-col items-start justify-start gap-1">
													<span className="flex-wrap">
														{scholar} →{" "}
														<br className="flex md:hidden" />{" "}
														{student}
													</span>
													<span className="text-xs font-normal text-muted-foreground">
														Iniciado às 10h17
													</span>
												</div>
											</div>
											<Badge
												className="border-none"
												variant={
													status ===
													RequestStatus.ATTENDING
														? "warning"
														: "success"
												}
											>
												{status ===
												RequestStatus.ATTENDING
													? "Em atendimento"
													: "Finalizado"}
											</Badge>
										</div>
										<RoutePreview />
									</li>
								),
							)}
						</ul>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
