"use client";

import { Moon, Sun, Sunrise, TriangleAlert } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";
import { WeeklyCoverage } from "@/components/weekly-coverage";

import {
	cellKey,
	DAYS,
	type DayId,
	DEFAULT_SELECTED,
	SHIFTS,
	type ShiftId,
	STUDENT,
	WEEKLY_LIMIT,
} from "@/lib/shifts";
import { cn } from "@/lib/utils";

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

export function EditShiftDialog() {
	const [selected, setSelected] = React.useState<Set<string>>(
		() => new Set(DEFAULT_SELECTED),
	);

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

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button
						size="lg"
						className="bg-brand text-brand-foreground hover:bg-brand/90"
					/>
				}
			>
				Editar turnos
			</DialogTrigger>

			<DialogContent
				showCloseButton={false}
				className="w-full max-w-[min(960px,calc(100%-2rem))] gap-0 border-none bg-transparent p-0 ring-0 sm:max-w-[min(960px,calc(100%-2rem))]"
			>
				<div className="flex flex-col items-start gap-4 lg:flex-row">
					{/* ── Painel principal: Editar turnos ── */}
					<div className="relative w-full rounded-xl border border-border bg-card p-5 text-card-foreground lg:w-[480px]">
						<DialogClose
							render={
								<Button
									variant="ghost"
									size="icon-sm"
									className="absolute top-3 right-3"
								/>
							}
						>
							<span
								aria-hidden="true"
								className="text-lg leading-none"
							>
								&times;
							</span>
							<span className="sr-only">Fechar</span>
						</DialogClose>

						<h2 className="font-heading text-xl font-semibold tracking-tight">
							Editar turnos
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Selecione turno &times; dia
						</p>

						{/* Estudante */}
						<div className="mt-4 flex items-center gap-3 border-b border-border pb-4">
							<Avatar size="lg">
								<AvatarFallback className="bg-info/20 text-info">
									{STUDENT.initials}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium">{STUDENT.name}</p>
								<p className="text-sm text-muted-foreground">
									Matrícula {STUDENT.registration}
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
														className="size-5 data-checked:border-brand data-checked:bg-brand data-checked:text-brand-foreground dark:data-checked:bg-brand"
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
										exceeds ? "bg-destructive" : "bg-brand",
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

						{/* Ações */}
						<div className="mt-5 flex justify-end gap-2">
							<DialogClose render={<Button variant="outline" />}>
								Cancelar
							</DialogClose>
							<Button className="bg-brand text-brand-foreground hover:bg-brand/90">
								{exceeds
									? "Salvar mesmo assim"
									: "Salvar turnos"}
							</Button>
						</div>
					</div>

					{/* ── Painel lateral: Cobertura semanal ── */}
					<WeeklyCoverage selected={selected} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
