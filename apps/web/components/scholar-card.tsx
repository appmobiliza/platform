import { getCurrentShift, type ScholarShiftValues } from "@mobiliza/contracts";

import { ScholarDetailsTrigger } from "@/components/details";
import { ProgressWithLabel } from "@/components/progress-with-label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getInitials } from "@/lib/utils";

import { EditShiftDialog } from "@/app/(dashboard)/bolsistas/dialog/edit-shift";
import type { ScholarData } from "@/data/scholars-data";

const SCHOLARS_SERVICES_AVERAGE = 150;
const MONTHLY_HOURS_GOAL = 40;

enum ScholarStatus {
	AVAILABLE = "Disponível",
	UNAVAILABLE = "Em atendimento",
	OFF_SHIFT = "Fora do turno",
}

function getScholarStatus(isAvailable: boolean, shift: string) {
	if (shift !== getCurrentShift()) {
		return ScholarStatus.OFF_SHIFT;
	}

	if (isAvailable) {
		return ScholarStatus.AVAILABLE;
	}

	return ScholarStatus.UNAVAILABLE;
}

function getBadgeLabel(status: ScholarStatus) {
	switch (status) {
		case ScholarStatus.AVAILABLE:
			return "Disponível";
		case ScholarStatus.UNAVAILABLE:
			return "Em atendimento";
		case ScholarStatus.OFF_SHIFT:
			return "Fora do turno";
	}
}

function getLabelVariant(status: ScholarStatus) {
	switch (status) {
		case ScholarStatus.AVAILABLE:
			return "success";
		case ScholarStatus.UNAVAILABLE:
			return "warning";
		case ScholarStatus.OFF_SHIFT:
			return "destructive";
	}
}

function getShiftLabel(shift: ScholarShiftValues) {
	switch (shift) {
		case "morning":
			return "Manhã";
		case "afternoon":
			return "Tarde";
		case "night":
			return "Noite";
		default:
			return shift;
	}
}

export function ScholarCard({ scholar }: { scholar: ScholarData }) {
	const status = getScholarStatus(
		scholar.profile.isAvailable,
		scholar.profile.shift,
	);

	return (
		<div className="flex flex-col items-center gap-4 rounded-md border p-4">
			<div className="flex flex-row flex-wrap items-start gap-4 justify-between w-full">
				<div className="flex flex-row items-start justify-start">
					<Avatar>
						<AvatarFallback>
							{getInitials(scholar.user.name)}
						</AvatarFallback>
						<AvatarImage
							src={scholar.user.image || undefined}
							alt={scholar.user.name}
						/>
					</Avatar>
					<div className="ml-4 flex flex-col items-start">
						<p className="text-sm font-medium">
							{scholar.user.name}
						</p>
						<p className="text-sm text-muted-foreground">
							{getShiftLabel(scholar.profile.shift)} •{" "}
							{scholar.profile.course}
						</p>
					</div>
				</div>
				<Badge variant={getLabelVariant(status)}>
					{getBadgeLabel(status)}
				</Badge>
			</div>
			<div className="flex flex-col items-start w-full">
				<ProgressWithLabel
					label="Atendimentos"
					value={scholar.summary.servicesAmount}
					percentage={Math.round(
						(scholar.summary.servicesAmount /
							SCHOLARS_SERVICES_AVERAGE) *
							100,
					)}
					variant="horizontal"
				/>
				<ProgressWithLabel
					label="Horas no mês"
					value={scholar.summary.monthHours}
					percentage={Math.round(
						(scholar.summary.monthHours / MONTHLY_HOURS_GOAL) * 100,
					)}
					variant="horizontal"
				/>
			</div>
			<div className="flex flex-col md:flex-row flex-wrap items-start w-full gap-2">
				<ScholarDetailsTrigger
					scholar={scholar}
					className="flex-1 w-full md:w-auto py-2"
				/>
				<EditShiftDialog>
					<Button
						className="flex-1 w-full  md:w-auto py-2"
						variant="outline"
					>
						Editar turno
					</Button>
				</EditShiftDialog>
			</div>
		</div>
	);
}
