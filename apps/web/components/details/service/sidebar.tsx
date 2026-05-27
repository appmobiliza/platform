"use client";

import { scholarShiftLabels } from "@mobiliza/db/schema";

import { DetailsSection } from "@/components/details/details-section";
import { DetailsSidebar } from "@/components/details/details-sidebar";
import { RoutePreview } from "@/components/route-preview";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { getInitials } from "@/lib/utils";

import type { ServiceEntry } from "@/data/services-data";

import { closeServiceDetails, useServiceDetailsEntry } from "./store";

function getStatusBadgeVariant(status: ServiceEntry["status"]) {
	if (status === "concluded") {
		return "success";
	}

	if (status === "in_progress") {
		return "warning";
	}

	return "destructive";
}

function getStatusLabel(status: ServiceEntry["status"]) {
	if (status === "concluded") {
		return "Finalizado";
	}

	if (status === "in_progress") {
		return "Em atendimento";
	}

	return "Não atendido";
}

function ServiceDetailsContent({ entry }: { entry: ServiceEntry }) {
	return (
		<div className="flex flex-col gap-6">
			<DetailsSection label="Aluno">
				<div className="flex items-center gap-3">
					<Avatar className="h-10 w-10">
						<AvatarFallback>
							{getInitials(entry.student.user.name)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="font-medium">{entry.student.user.name}</p>
						<p className="text-sm text-muted-foreground">Aluno</p>
					</div>
				</div>
			</DetailsSection>

			<DetailsSection label="Bolsista">
				<div className="flex items-center gap-3">
					<Avatar className="h-10 w-10">
						<AvatarFallback>
							{getInitials(entry.scholar.user.name)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="font-medium">{entry.scholar.user.name}</p>
						<p className="text-sm text-muted-foreground">
							Turno{" "}
							{scholarShiftLabels[entry.scholar.profile.shift]}
						</p>
					</div>
				</div>
			</DetailsSection>

			<DetailsSection label="Percurso">
				<RoutePreview />
			</DetailsSection>

			<div className="grid grid-cols-2 gap-4">
				<DetailsSection label="Início">
					<p className="text-sm">10h17</p>
				</DetailsSection>
				<DetailsSection label="Duração">
					<p className="text-sm">em andamento</p>
				</DetailsSection>
				<DetailsSection label="Espera">
					<p className="text-sm">1 min 42 s</p>
				</DetailsSection>
				<DetailsSection label="Data">
					<p className="text-sm">24/04/2026</p>
				</DetailsSection>
			</div>

			<DetailsSection label="Observação">
				<div className="rounded-md bg-muted p-3">
					<p className="text-sm">
						"Lorem ipsum dolor sit amet, consectetur adipiscing
						elit. Sed do eiusmod tempor incididunt ut labore et
						dolore magna aliqua."
					</p>
				</div>
			</DetailsSection>

			<Separator />

			<DetailsSection label="Histórico com esse aluno">
				<ul className="flex flex-col gap-3">
					{[
						{
							id: 1,
							date: "20/04",
							route: "RU → IC",
							duration: "9 min",
						},
						{
							id: 2,
							date: "18/04",
							route: "Biblioteca → RU",
							duration: "12 min",
						},
						{
							id: 3,
							date: "12/04",
							route: "IC → LAB",
							duration: "7 min",
						},
					].map((item) => (
						<li
							className="flex w-full items-center justify-between text-sm"
							key={item.id}
						>
							<p>
								{item.date} · {item.route}
							</p>
							<p>{item.duration}</p>
						</li>
					))}
				</ul>
			</DetailsSection>
		</div>
	);
}

export function ServiceDetailsSidebar() {
	const selectedEntry = useServiceDetailsEntry();
	const entry = selectedEntry.item;

	// NOTE: Não podemos adicionar um safeguard aqui porque o componente é renderizado mesmo quando não há um atendimento selecionado, e isso é necessário para a animação de entrada/saída da sidebar funcionar corretamente. O componente de detalhes apenas não renderiza nada dentro da sidebar quando não há um atendimento selecionado, mas a sidebar em si precisa ser montada para que a animação funcione.

	return (
		<DetailsSidebar
			open={selectedEntry.isOpen}
			header={
				entry && (
					<div className="flex w-full items-center justify-between gap-2 md:flex-col md:items-start">
						<h2 className="font-semibold">
							Detalhes do atendimento
						</h2>
						<Badge variant={getStatusBadgeVariant(entry.status)}>
							{getStatusLabel(entry.status)}
						</Badge>
					</div>
				)
			}
			onClose={closeServiceDetails}
		>
			{entry && <ServiceDetailsContent entry={entry} />}
		</DetailsSidebar>
	);
}
