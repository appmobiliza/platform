"use client";

import { User, Users } from "lucide-react";

import { cn } from "@/lib/utils";

import {
	BASE_COVERAGE,
	type CoverageStatus,
	cellKey,
	coverageStatus,
	DAY_LABEL,
	DAYS,
	type DayId,
	SHIFTS,
	type ShiftId,
} from "@/data/shifts";

const STATUS_CLASSES: Record<CoverageStatus, string> = {
	empty: "border-destructive/40 bg-destructive/15 text-destructive",
	mid: "border-warning/40 bg-warning/15 text-warning",
	full: "border-success/40 bg-success/15 text-success",
	editing: "border-info/50 bg-info/15 text-info",
};

function CoverageBadge({
	count,
	status,
}: {
	count: number;
	status: CoverageStatus;
}) {
	const Icon = status === "editing" ? Users : User;
	return (
		<span
			className={cn(
				"inline-flex min-w-12 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-sm font-medium tabular-nums",
				STATUS_CLASSES[status],
			)}
		>
			{count > 0 && <Icon className="size-3.5" aria-hidden="true" />}
			{count}
		</span>
	);
}

function LegendDot({ className, label }: { className: string; label: string }) {
	return (
		<div className="flex items-center gap-2">
			<span
				className={cn("size-3.5 rounded-[4px]", className)}
				aria-hidden="true"
			/>
			<span className="text-sm text-muted-foreground">{label}</span>
		</div>
	);
}

export function WeeklyCoverage({
	selected,
	coverage: baseCoverage,
}: {
	selected: Set<string>;
	coverage?: Record<ShiftId, Record<DayId, number>>;
}) {
	return (
		<section
			aria-label="Cobertura semanal"
			className="w-full rounded-xl border border-border bg-card p-5 text-card-foreground sm:w-[440px]"
		>
			<h2 className="font-heading text-xl font-semibold tracking-tight">
				Cobertura semanal
			</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Bolsistas por turno e dia &middot; cronograma semanal
			</p>

			<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
				<LegendDot
					className="bg-destructive"
					label="Sem cobertura / 1 bolsista"
				/>
				<LegendDot className="bg-warning" label="2" />
				<LegendDot className="bg-success" label="3+" />
				<LegendDot className="bg-info" label="Lucas (editando)" />
			</div>

			<div className="mt-5 overflow-x-auto">
				<table className="w-full border-separate border-spacing-2">
					<thead>
						<tr>
							<th className="px-1 text-left text-sm font-normal text-muted-foreground">
								Turno
							</th>
							{DAYS.map((day) => (
								<th
									key={day}
									className="px-1 text-center text-xs font-medium tracking-wide text-muted-foreground"
								>
									{DAY_LABEL[day]}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{SHIFTS.map((shift) => (
							<tr key={shift.id}>
								<th className="whitespace-nowrap pr-2 text-left text-sm font-normal text-foreground">
									{shift.label}
								</th>
								{DAYS.map((day) => {
									const isEditing = selected.has(
										cellKey(day, shift.id),
									);
									const count =
										(baseCoverage ?? BASE_COVERAGE)[
											shift.id
										][day] + (isEditing ? 1 : 0);
									const status = coverageStatus(
										count,
										isEditing,
									);
									return (
										<td key={day} className="text-center">
											<CoverageBadge
												count={count}
												status={status}
											/>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
