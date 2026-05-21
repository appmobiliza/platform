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
				<Alert>
					<TriangleAlert className="h-4 w-4" />
					<AlertTitle>Atenção!</AlertTitle>
					<AlertDescription>
						A solicitação de Maria Aparecida aguarda resposta há 4
						min. Nenhum bolsista aceitou ainda.
					</AlertDescription>
				</Alert>
				<Card className="group gap-2" data-size="sm">
					<CardHeader>
						<CardAction>
							<Users className="h-4 w-4 mt-1 text-muted-foreground" />
						</CardAction>
						<CardTitle>Atendimentos hoje</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-bold">7</p>
					</CardContent>
					<CardFooter>
						<p className="text-sm text-muted-foreground">
							+2 em relação a ontem
						</p>
					</CardFooter>
				</Card>
				<Card className="group gap-2" data-size="sm">
					<CardHeader>
						<CardAction>
							<CloudLightning className="h-4 w-4 mt-1 text-muted-foreground" />
						</CardAction>
						<CardTitle>Em andamento agora</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-bold">2</p>
					</CardContent>
					<CardFooter>
						<p className="text-sm text-muted-foreground">
							no turno atual
						</p>
					</CardFooter>
				</Card>
				<Card className="group gap-2" data-size="sm">
					<CardHeader>
						<CardAction>
							<Clock className="h-4 w-4 mt-1 text-muted-foreground" />
						</CardAction>
						<CardTitle>Tempo de espera</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-bold">~5m</p>
					</CardContent>
					<CardFooter>
						<p className="text-sm text-muted-foreground">
							+21% do último dia
						</p>
					</CardFooter>
				</Card>
				<Card className="group gap-2" data-size="sm">
					<CardHeader>
						<CardAction>
							<Activity className="h-4 w-4 mt-1 text-muted-foreground" />
						</CardAction>
						<CardTitle>Bolsistas disponíveis</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-bold">
							2{" "}
							<span className="text-lg font-normal text-muted-foreground">
								/ 5
							</span>
						</p>
					</CardContent>
					<CardFooter>
						<p className="text-sm text-muted-foreground">
							no turno atual
						</p>
					</CardFooter>
				</Card>
			</div>
		</section>
	);
}
