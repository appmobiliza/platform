import {
	Activity,
	Clock,
	CloudLightning,
	TriangleAlert,
	Users,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

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
					<Alert>
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
			</div>
		</section>
	);
}
