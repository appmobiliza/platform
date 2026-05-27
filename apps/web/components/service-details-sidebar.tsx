"use client";

import { scholarShiftLabels } from "@mobiliza/db/schema";

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

import { DetailsSection } from "./details-section";
import { RoutePreview } from "./route-preview";

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
			header={
				<div className="flex items-center md:flex-col md:items-start gap-2 w-full justify-between">
					<h2 className="font-semibold">Detalhes do atendimento</h2>
					<Badge variant={getStatusBadgeVariant(entry.status)}>
						{getStatusLabel(entry.status)}
					</Badge>
				</div>
			}
			onClose={closeServiceDetails}
		>
			<ServiceDetailsContent entry={entry} />
		</DetailsSidebar>
	);
}
