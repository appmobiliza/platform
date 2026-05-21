import {
	Activity,
	Clock,
	CloudLightning,
	TriangleAlert,
	Users,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

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
			</div>
		</section>
	);
}
