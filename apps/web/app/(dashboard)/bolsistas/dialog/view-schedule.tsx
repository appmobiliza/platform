"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { trpc } from "@/providers/trpc-provider";

// ─── Mapping API enums → display labels ────────────────────────────────

const DAY_LABEL: Record<string, string> = {
	monday: "SEG",
	tuesday: "TER",
	wednesday: "QUA",
	thursday: "QUI",
	friday: "SEX",
};

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

const SHIFTS = [
	{ id: "morning", label: "Matutino", range: "07-12h" },
	{ id: "afternoon", label: "Vespertino", range: "12-17h" },
	{ id: "night", label: "Noturno", range: "17-22h" },
] as const;

interface Props {
	children: React.ReactNode;
}

export function ViewScheduleDialog({ children }: Props) {
	const [open, setOpen] = React.useState(false);
	const { data: schedules, isLoading } = trpc.profiles.getSchedules.useQuery(
		undefined,
		{ enabled: open },
	);

	// Build lookup: dayOfWeek → shift → scholar names[]
	const scheduleMap = React.useMemo(() => {
		const map = new Map<
			string,
			Map<string, Array<{ name: string; enrollment: string }>>
		>();
		if (!schedules) return map;

		for (const scholar of schedules) {
			for (const entry of scholar.schedule) {
				let dayMap = map.get(entry.dayOfWeek);
				if (!dayMap) {
					dayMap = new Map();
					map.set(entry.dayOfWeek, dayMap);
				}
				const list = dayMap.get(entry.shift);
				if (list) {
					list.push({
						name: scholar.name,
						enrollment: scholar.enrollment,
					});
				} else {
					dayMap.set(entry.shift, [
						{ name: scholar.name, enrollment: scholar.enrollment },
					]);
				}
			}
		}
		return map;
	}, [schedules]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="w-full gap-0 p-0">
				<div className="p-6 pb-0">
					<DialogHeader>
						<DialogTitle>Grade de bolsistas</DialogTitle>
						<DialogDescription>
							Distribuição semanal dos bolsistas por turno e dia
						</DialogDescription>
					</DialogHeader>
				</div>

				<Separator className="my-4" />

				<ScrollArea className="max-h-[60vh] w-full px-6">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : !schedules || schedules.length === 0 ? (
						<p className="py-12 text-center text-sm text-muted-foreground">
							Nenhum bolsista cadastrado.
						</p>
					) : (
						<div className="overflow-x-auto pb-6">
							<table className="w-full border-separate border-spacing-2">
								<thead>
									<tr>
										<th className="w-28 px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Turno
										</th>
										{DAYS.map((day) => (
											<th
												key={day}
												className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
											>
												{DAY_LABEL[day]}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{SHIFTS.map((shift) => (
										<tr key={shift.id}>
											<td className="w-28 px-2 py-3 align-top">
												<div className="flex flex-col">
													<span className="text-sm font-medium text-foreground">
														{shift.label}
													</span>
													<span className="text-xs text-muted-foreground">
														{shift.range}
													</span>
												</div>
											</td>
											{DAYS.map((day) => {
												const scholars =
													scheduleMap
														.get(day)
														?.get(shift.id) ?? [];
												return (
													<td
														key={day}
														className="px-2 py-3 align-top"
													>
														{scholars.length > 0 ? (
															<div className="flex flex-col gap-1.5">
																{scholars.map(
																	(s) => (
																		<Badge
																			key={`${s.enrollment}-${day}-${shift.id}`}
																			variant="secondary"
																			className="justify-start truncate rounded-md px-2 py-1 text-xs font-medium"
																		>
																			{
																				s.name
																			}
																		</Badge>
																	),
																)}
															</div>
														) : (
															<div className="h-8 rounded-md border border-dashed border-border" />
														)}
													</td>
												);
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</ScrollArea>

				<Separator />

				<DialogFooter className="px-6 py-4">
					<DialogClose asChild>
						<Button variant="outline">Fechar</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
