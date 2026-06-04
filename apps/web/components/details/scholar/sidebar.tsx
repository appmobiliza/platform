"use client";

import {
	type ScholarShiftValues,
	scholarShiftLabels,
} from "@mobiliza/contracts";

import { DetailsSidebar } from "@/components/details/details-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { CachedScholar } from "@/lib/cached-data";
import { getInitials } from "@/lib/utils";

import { MutateScholarDialog } from "@/app/(dashboard)/bolsistas/dialog/add-scholar";

import { DetailsSection } from "../../section";
import { closeScholarDetails, useScholarDetailsEntry } from "./store";

const STATUS_LABEL: Record<CachedScholar["status"], string> = {
	available: "Disponível",
	busy: "Em atendimento",
	off_shift: "Fora do turno",
	pending: "Pendente",
};

const STATUS_VARIANT: Record<
	CachedScholar["status"],
	"success" | "warning" | "destructive" | "secondary"
> = {
	available: "success",
	busy: "warning",
	off_shift: "destructive",
	pending: "secondary",
};

function getShiftLabel(shift: string) {
	const key = shift as ScholarShiftValues;
	return scholarShiftLabels[key] ?? shift;
}

function ScholarDetailsContent({ scholar }: { scholar: CachedScholar }) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3 flex-row w-full">
				<Card size="sm" className="flex-1 bg-muted">
					<CardHeader className="space-y-2">
						<CardTitle className="font-normal">
							Atendimentos
						</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{scholar.summary.servicesAmount}
					</CardContent>
				</Card>

				<Card size="sm" className="flex-1 bg-muted">
					<CardHeader className="space-y-2">
						<CardTitle className="font-normal">
							Horas no mês
						</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{scholar.summary.monthHours}
					</CardContent>
				</Card>
			</div>

			<DetailsSection label="Informações">
				{[
					{
						title: "Matrícula",
						description: scholar.profile.enrollment,
					},
					{
						title: "Ativo desde",
						description: new Date(
							scholar.user.createdAt,
						).toLocaleDateString(),
					},
					{
						title: "Tempo médio",
						description: `${scholar.summary.averageDuration} min / atend.`,
					},
				].map(({ title, description }) => (
					<div
						key={title}
						className="flex items-center justify-between gap-3 text-sm"
					>
						<span className="text-muted-foreground">{title}</span>
						<span>{description}</span>
					</div>
				))}
			</DetailsSection>

			<Separator />

			<Button variant="outline" className="w-full">
				Ver histórico completo
			</Button>
			<div className="flex flex-row gap-2 justify-between">
				<MutateScholarDialog>
					<Button className="w-full">Editar bolsista</Button>
				</MutateScholarDialog>
				<Button variant="destructive" className="w-[49%]">
					Desativar
				</Button>
			</div>
		</div>
	);
}

export function ScholarDetailsSidebar() {
	const selectedScholar = useScholarDetailsEntry();
	const scholar = selectedScholar.item;

	return (
		<DetailsSidebar
			open={selectedScholar.isOpen}
			header={
				scholar && (
					<div className="flex w-full justify-between gap-3 flex-col items-start">
						<div className="flex items-center gap-3 text-left">
							<Avatar className="h-10 w-10">
								<AvatarFallback>
									{getInitials(scholar.user.name)}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="font-medium">
									{scholar.user.name}
								</p>
								<p className="text-sm text-muted-foreground">
									{scholar.profile.course}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 flex-row">
							<Badge variant={STATUS_VARIANT[scholar.status]}>
								{STATUS_LABEL[scholar.status]}
							</Badge>
							<Badge variant={"secondary"}>
								{getShiftLabel(scholar.profile.shift)}
							</Badge>
						</div>
					</div>
				)
			}
			onClose={closeScholarDetails}
		>
			{scholar && <ScholarDetailsContent scholar={scholar} />}
		</DetailsSidebar>
	);
}
