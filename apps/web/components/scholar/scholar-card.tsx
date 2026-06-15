import { ScholarDetailsTrigger } from "@/components/details";
import { ProgressWithLabel } from "@/components/progress-with-label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { CachedScholar } from "@/lib/cached-data";
import { getInitials } from "@/lib/utils";

import { EditShiftDialog } from "@/app/(dashboard)/bolsistas/dialog/edit-shift";

const SCHOLARS_SERVICES_AVERAGE = 150;
const MONTHLY_HOURS_GOAL = 40;

const STATUS_LABEL: Record<CachedScholar["status"], string> = {
	available: "Disponível",
	busy: "Em atendimento",
	pending: "Pendente",
};

const STATUS_VARIANT: Record<
	CachedScholar["status"],
	"success" | "warning" | "destructive" | "secondary"
> = {
	available: "success",
	busy: "warning",
	pending: "secondary",
};

export function ScholarCard({ scholar }: { scholar: CachedScholar }) {
	return (
		<div className="flex flex-col items-center gap-4 rounded-md border p-4">
			<div className="flex flex-row flex-wrap items-start gap-4 justify-between w-full">
				<div className="flex flex-row items-start justify-start">
					<Avatar>
						<AvatarFallback>
							{getInitials(scholar.user.name)}
						</AvatarFallback>
						<AvatarImage
							src={scholar.user.image ?? undefined}
							alt={scholar.user.name}
						/>
					</Avatar>
					<div className="ml-4 flex flex-col items-start">
						<p className="text-sm font-medium">
							{scholar.user.name}
						</p>
						<p className="text-sm text-muted-foreground">
							{scholar.profile.course}
						</p>
					</div>
				</div>
				<Badge variant={STATUS_VARIANT[scholar.status]}>
					{STATUS_LABEL[scholar.status]}
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
					value={Math.round(
						scholar.summary.monthDurationSeconds / 3600,
					)}
					percentage={Math.round(
						(Math.round(
							scholar.summary.monthDurationSeconds / 3600,
						) /
							MONTHLY_HOURS_GOAL) *
							100,
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
