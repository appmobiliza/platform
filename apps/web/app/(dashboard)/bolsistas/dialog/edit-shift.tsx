"use client";

import { Moon, Sun, Sunrise, TriangleAlert } from "lucide-react";
import * as React from "react";

import { WeeklyCoverage } from "@/components/scholar/weekly-coverage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import type { CachedScholar } from "@/lib/cached-data";
import { cn } from "@/lib/utils";

import {
	cellKey,
	DAYS,
	type DayId,
	SHIFTS,
	type ShiftId,
	WEEKLY_LIMIT,
} from "@/data/shifts";
import { trpc } from "@/providers/trpc-provider";

// ─── Mapping between UI shift system and API enum values ────────────────

const DAY_TO_ENUM: Record<DayId, string> = {
	Seg: "monday",
	Ter: "tuesday",
	Qua: "wednesday",
	Qui: "thursday",
	Sex: "friday",
};

const ENUM_TO_DAY: Record<string, DayId> = {
	monday: "Seg",
	tuesday: "Ter",
	wednesday: "Qua",
	thursday: "Qui",
	friday: "Sex",
};

const SHIFT_TO_ENUM: Record<ShiftId, string> = {
	MAT: "morning",
	VES: "afternoon",
	NOT: "night",
};

const ENUM_TO_SHIFT: Record<string, ShiftId> = {
	morning: "MAT",
	afternoon: "VES",
	night: "NOT",
};

function entriesToSelected(
	entries: Array<{ dayOfWeek: string; shift: string }>,
): Set<string> {
	const set = new Set<string>();
	for (const entry of entries) {
		const day = ENUM_TO_DAY[entry.dayOfWeek];
		const shift = ENUM_TO_SHIFT[entry.shift];
		if (day && shift) {
			set.add(cellKey(day, shift));
		}
	}
	return set;
}

function selectedToEntries(
	selected: Set<string>,
): Array<{ dayOfWeek: string; shift: string }> {
	const entries: Array<{ dayOfWeek: string; shift: string }> = [];
	for (const key of selected) {
		const [day, shift] = key.split("-") as [DayId, ShiftId];
		const dayOfWeek = DAY_TO_ENUM[day];
		const shiftEnum = SHIFT_TO_ENUM[shift];
		if (dayOfWeek && shiftEnum) {
			entries.push({ dayOfWeek, shift: shiftEnum });
		}
	}
	return entries;
}

const SHIFT_ICON = {
	sunrise: Sunrise,
	sun: Sun,
	moon: Moon,
} as const;

function ShiftLegend() {
	return (
		<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
			{SHIFTS.map((shift) => (
				<div key={shift.id} className="flex items-center gap-2">
					<span
						className={cn("size-3.5 rounded-[4px]", {
							"bg-success": shift.token === "success",
							"bg-warning": shift.token === "warning",
							"bg-info": shift.token === "info",
						})}
						aria-hidden="true"
					/>
					<span className="text-sm text-muted-foreground">
						{shift.label} {shift.range}
					</span>
				</div>
			))}
		</div>
	);
}

interface Props {
	children: React.ReactNode;
	scholar?: CachedScholar;
}

export function EditShiftDialog({ children, scholar }: Props) {
	const trpcUtils = trpc.useUtils();
	const [open, setOpen] = React.useState(false);

	// Fetch all schedules
	const { data: schedulesData } = trpc.profiles.getSchedules.useQuery(
		undefined,
		{
			enabled: open && !!scholar,
		},
	);

	// Find current scholar's schedule
	const currentEntries = React.useMemo(() => {
		if (!schedulesData || !scholar) return [];
		const found = schedulesData.find(
			(s) => s.scholarId === scholar.profile.id,
		);
		return found?.schedule ?? [];
	}, [schedulesData, scholar]);

	// Compute real coverage from all schedules (excluding current scholar)
	const coverageFromApi = React.useMemo(() => {
		const coverage: Record<ShiftId, Record<DayId, number>> = {
			MAT: { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0 },
			VES: { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0 },
			NOT: { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0 },
		};

		if (!schedulesData) return coverage;

		for (const s of schedulesData) {
			if (s.scholarId === scholar?.profile.id) continue;
			for (const entry of s.schedule) {
				const day = ENUM_TO_DAY[entry.dayOfWeek];
				const shift = ENUM_TO_SHIFT[entry.shift];
				if (day && shift) {
					coverage[shift][day]++;
				}
			}
		}

		return coverage;
	}, [schedulesData, scholar]);

	// Initialize selected from existing schedule
	const [selected, setSelected] = React.useState<Set<string>>(new Set());

	React.useEffect(() => {
		if (open && currentEntries.length > 0) {
			setSelected(entriesToSelected(currentEntries));
		} else if (open && (!scholar || currentEntries.length === 0)) {
			setSelected(new Set());
		}
	}, [open, currentEntries, scholar]);

	// Save mutation
	const saveSchedule = trpc.profiles.updateScholarSchedule.useMutation({
		onSuccess() {
			trpcUtils.profiles.getSchedules.invalidate();
			setOpen(false);
		},
	});

	const toggle = React.useCallback((day: DayId, shift: ShiftId) => {
		setSelected((prev) => {
			const next = new Set(prev);
			const key = cellKey(day, shift);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}, []);

	const totalHours = selected.size * 5;
	const exceeds = totalHours > WEEKLY_LIMIT;
	const pct = Math.min(100, Math.round((totalHours / WEEKLY_LIMIT) * 100));
	const isPending = saveSchedule.isPending;

	function handleSave() {
		if (!scholar) return;
		saveSchedule.mutate({
			scholarId: scholar.profile.id,
			entries: selectedToEntries(selected),
		});
	}

	const initials = scholar
		? scholar.user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "??";

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent
				showCloseButton={false}
				className="w-full max-w-[min(960px,calc(100%-2rem))] gap-0 border-none bg-transparent p-0 ring-0 sm:max-w-[min(960px,calc(100%-2rem))]"
			>
				<div className="flex flex-col items-start gap-4 lg:flex-row">
					{/* ── Painel principal: Editar turnos ── */}
					<div className="relative w-full rounded-xl border border-border bg-card p-5 text-card-foreground lg:w-[480px]">
						<DialogClose asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								className="absolute top-3 right-3"
							>
								<span
									aria-hidden="true"
									className="text-lg leading-none"
								>
									&times;
								</span>
								<span className="sr-only">Fechar</span>
							</Button>
						</DialogClose>

						<DialogHeader className="p-0">
							<DialogTitle className="font-heading text-xl font-semibold tracking-tight">
								Editar turnos
							</DialogTitle>
							<DialogDescription>
								Selecione turno &times; dia
							</DialogDescription>
						</DialogHeader>

						{/* Estudante */}
						<div className="mt-4 flex items-center gap-3 border-b border-border pb-4">
							<Avatar size="lg">
								<AvatarFallback className="bg-info/20 text-info">
									{scholar ? initials : "??"}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium">
									{scholar?.user.name ?? "Bolsista"}
								</p>
								<p className="text-sm text-muted-foreground">
									Matrícula{" "}
									{scholar?.profile.enrollment ?? "---"}
								</p>
							</div>
						</div>

						<div className="mt-4">
							<ShiftLegend />
						</div>

						{/* Grade turno x dia */}
						<div className="mt-5">
							<div className="grid grid-cols-[1fr_repeat(3,3.5rem)] items-end gap-y-1">
								<span className="text-xs font-medium tracking-wide text-muted-foreground">
									DIA
								</span>
								{SHIFTS.map((shift) => {
									const Icon = SHIFT_ICON[shift.icon];
									return (
										<div
											key={shift.id}
											className="flex flex-col items-center gap-1"
										>
											<Icon
												className="size-4 text-muted-foreground"
												aria-hidden="true"
											/>
											<span className="text-xs font-medium tracking-wide text-muted-foreground">
												{shift.id}
											</span>
										</div>
									);
								})}
							</div>

							<div className="mt-2 divide-y divide-border">
								{DAYS.map((day) => (
									<div
										key={day}
										className="grid grid-cols-[1fr_repeat(3,3.5rem)] items-center py-2.5"
									>
										<span className="text-sm">{day}</span>
										{SHIFTS.map((shift) => {
											const checked = selected.has(
												cellKey(day, shift.id),
											);
											return (
												<div
													key={shift.id}
													className="flex justify-center"
												>
													<Checkbox
														checked={checked}
														onCheckedChange={() =>
															toggle(
																day,
																shift.id,
															)
														}
														aria-label={`${shift.label} ${day}`}
														className="size-5 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary"
													/>
												</div>
											);
										})}
									</div>
								))}
							</div>
						</div>

						{/* Carga horária */}
						<div className="mt-5">
							<div className="flex items-center justify-between text-sm">
								<span className="font-medium">
									Carga horária semanal
								</span>
								<span
									className={cn(
										"tabular-nums",
										exceeds
											? "text-destructive"
											: "text-muted-foreground",
									)}
								>
									{totalHours}h / {WEEKLY_LIMIT}h
								</span>
							</div>
							<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
								<div
									className={cn(
										"h-full rounded-full transition-all",
										exceeds
											? "bg-destructive"
											: "bg-primary",
									)}
									style={{ width: `${pct}%` }}
								/>
							</div>
						</div>

						{/* Aviso */}
						{exceeds && (
							<div
								role="alert"
								className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/15 p-3 text-sm text-destructive"
							>
								<TriangleAlert
									className="mt-0.5 size-4 shrink-0"
									aria-hidden="true"
								/>
								<p>
									Carga de {totalHours}h excede o limite de{" "}
									{WEEKLY_LIMIT}h semanais. Salvar mesmo
									assim?
								</p>
							</div>
						)}

						{saveSchedule.error && (
							<div
								role="alert"
								className="mt-4 rounded-lg border border-destructive/30 bg-destructive/15 p-3 text-sm text-destructive"
							>
								{saveSchedule.error.message}
							</div>
						)}

						{/* Ações */}
						<div className="mt-5 flex justify-end gap-2">
							<DialogClose asChild>
								<Button variant="outline">Cancelar</Button>
							</DialogClose>
							<Button
								onClick={handleSave}
								disabled={isPending || !scholar}
								className="bg-primary text-primary-foreground hover:bg-primary/90"
							>
								{isPending
									? "Salvando..."
									: exceeds
										? "Salvar mesmo assim"
										: "Salvar turnos"}
							</Button>
						</div>
					</div>

					{/* ── Painel lateral: Cobertura semanal ── */}
					<WeeklyCoverage
						selected={selected}
						coverage={coverageFromApi}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
