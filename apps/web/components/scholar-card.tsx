import { getInitials } from "@/lib/utils";

import { ProgressWithLabel } from "./progress-with-label";
import type { ScholarData } from "./scholars-data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

const SCHOLARS_SERVICES_AVERAGE = 150;
const MONTHLY_HOURS_GOAL = 40;

export function ScholarCard({ scholar }: { scholar: ScholarData }) {
	return (
		<div className="flex flex-col items-center gap-4 rounded-md border p-4">
			<div className="flex flex-row items-center justify-between w-full">
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
							{scholar.profile.shift} • {scholar.profile.course}
						</p>
					</div>
				</div>
				<Badge
					variant={
						scholar.profile.isAvailable ? "success" : "destructive"
					}
				>
					{scholar.profile.isAvailable
						? "Disponível"
						: "Indisponível"}
				</Badge>
			</div>
			<div className="flex flex-col items-start w-full">
				<ProgressWithLabel
					label="Atendimentos"
					value={scholar.summary.servicesAmounted}
					percentage={Math.round(
						(scholar.summary.servicesAmounted /
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
		</div>
	);
}
