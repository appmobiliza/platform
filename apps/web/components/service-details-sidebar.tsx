"use client";

import { DetailsSidebar } from "@/components/details-sidebar";
import {
	closeServiceDetails,
	useServiceDetailsEntry,
} from "@/components/service-details-store";
import type { ServiceEntry } from "@/components/services-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getInitials } from "@/lib/utils";

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
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader className="space-y-2">
					<div className="flex items-center justify-between gap-4">
						<CardTitle>Resumo</CardTitle>
						<Badge variant={getStatusBadgeVariant(entry.status)}>
							{getStatusLabel(entry.status)}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						{entry.route} • {entry.date} às {entry.time}
					</p>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Bolsista</span>
						<span className="font-medium">
							{entry.scholar.name}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Aluno</span>
						<span className="font-medium">
							{entry.student.name}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Duração</span>
						<span className="font-medium">{entry.duration}</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Observações</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm leading-6 text-muted-foreground">
						{entry.notes}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Participantes</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarFallback>
								{getInitials(entry.scholar.name)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="font-medium">{entry.scholar.name}</p>
							<p className="text-sm text-muted-foreground">
								Bolsista
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarFallback>
								{getInitials(entry.student.name)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="font-medium">{entry.student.name}</p>
							<p className="text-sm text-muted-foreground">
								Aluno
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function ServiceDetailsSidebar() {
	const selectedEntry = useServiceDetailsEntry();
	const entry = selectedEntry.item;

	if (!entry) {
		return null;
	}

	return (
		<DetailsSidebar
			open={selectedEntry.isOpen}
			title="Detalhes do atendimento"
			description={`${entry.date} às ${entry.time}`}
			onClose={closeServiceDetails}
		>
			<ServiceDetailsContent entry={entry} />
		</DetailsSidebar>
	);
}
