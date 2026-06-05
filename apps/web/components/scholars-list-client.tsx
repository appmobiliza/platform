"use client";

import { scholarShiftLabels } from "@mobiliza/contracts";

import { Frown, Search, XIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ScholarCard } from "@/components/scholar-card";
import { StatusMessage } from "@/components/status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { useDebounce } from "@/hooks/use-debounce";
import type { CachedScholar } from "@/lib/cached-data";

import { ComboboxMultiple } from "./combobox-multiple";

// ─── Helpers ────────────────────────────────────────────────────────────

type StatusFilter = "all" | "active" | "inactive";

function matchesStatus(scholar: CachedScholar, filter: StatusFilter): boolean {
	if (filter === "all") return true;
	return filter === "active"
		? scholar.profile.isActive
		: !scholar.profile.isActive;
}

function matchesShifts(
	scholar: CachedScholar,
	selectedShifts: string[],
): boolean {
	if (selectedShifts.length === 0) return true;
	const shiftKey = scholar.profile.shift;
	return shiftKey != null && selectedShifts.includes(shiftKey);
}

// ─── Component ──────────────────────────────────────────────────────────

interface Props {
	initialData: {
		scholars: CachedScholar[];
		totalScholars: number;
		availableNow: number;
		inAttendance: number;
	};
}

export function ScholarsListClient({ initialData }: Props) {
	// ── State ─────────────────────────────────────────────────────────
	const [rawQuery, setRawQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
	const [selectedShifts, setSelectedShifts] = useState<string[]>([]);

	const debouncedQuery = useDebounce(rawQuery, 250);

	// ── Combobox value sync ───────────────────────────────────────────
	// When no shift is selected, the combobox shows "Todos os turnos"
	// internally. We keep `selectedShifts` as the raw array of keys.
	// The combobox receives `value` as the labels (so it reflects the UI),
	// and `onValueChange` syncs back to keys.
	const comboboxItems = useMemo(
		() =>
			Object.entries(scholarShiftLabels).map(([value, label]) => ({
				id: value,
				label,
			})),
		[],
	);

	const comboboxValue = useMemo(
		() =>
			selectedShifts.length === 0
				? ["Todos os turnos"]
				: selectedShifts.map(
						(s) =>
							scholarShiftLabels[
								s as keyof typeof scholarShiftLabels
							] ?? s,
					),
		[selectedShifts],
	);

	const handleComboboxChange = useCallback((nextLabels: string[]) => {
		// "Todos os turnos" means no selection
		if (nextLabels.includes("Todos os turnos")) {
			setSelectedShifts([]);
			return;
		}

		// Map labels back to keys
		const labelToKey = Object.fromEntries(
			Object.entries(scholarShiftLabels).map(([k, v]) => [v, k]),
		);

		const keys = nextLabels
			.map((l) => labelToKey[l])
			.filter(Boolean) as string[];

		// If all shifts are selected, treat as "todos"
		if (keys.length === Object.keys(scholarShiftLabels).length) {
			setSelectedShifts([]);
			return;
		}

		setSelectedShifts(keys);
	}, []);

	// ── Handlers ──────────────────────────────────────────────────────
	const handleQueryChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setRawQuery(e.target.value);
		},
		[],
	);

	const clearQuery = useCallback(() => {
		setRawQuery("");
	}, []);

	const handleStatusChange = useCallback((value: string) => {
		if (value === "all" || value === "active" || value === "inactive") {
			setSelectedStatus(value);
		} else {
			setSelectedStatus("all");
		}
	}, []);

	// ── Filtering ─────────────────────────────────────────────────────
	const filteredScholars = useMemo(() => {
		const query = debouncedQuery.toLowerCase().trim();

		return initialData.scholars.filter((scholar) => {
			if (!matchesStatus(scholar, selectedStatus)) return false;
			if (!matchesShifts(scholar, selectedShifts)) return false;
			if (!query) return true;

			return [
				scholar.user.name,
				scholar.profile.enrollment,
				scholar.profile.course,
				scholar.profile.campus,
			].some((value) => value.toLowerCase().includes(query));
		});
	}, [initialData.scholars, debouncedQuery, selectedStatus, selectedShifts]);

	// ── Render ────────────────────────────────────────────────────────
	return (
		<>
			{/* Filters */}
			<div className="flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
				{/* Search */}
				<div className="relative w-full md:max-w-sm">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por nome, matrícula ou curso"
						className="pl-9 pr-9"
						value={rawQuery}
						onChange={handleQueryChange}
					/>
					{rawQuery && (
						<Button
							type="button"
							size="icon-sm"
							variant="ghost"
							className="absolute right-1 top-1/2 -translate-y-1/2"
							onClick={clearQuery}
							aria-label="Limpar busca"
						>
							<XIcon className="size-4" />
						</Button>
					)}
				</div>

				{/* Shifts */}
				<ComboboxMultiple
					className="w-full md:max-w-sm"
					items={comboboxItems}
					allLabel="Todos os turnos"
					value={comboboxValue}
					onValueChange={handleComboboxChange}
				/>

				{/* Status toggle */}
				<div className="md:pr-6">
					<ToggleGroup
						type="single"
						size="sm"
						className="w-full min-w-max"
						value={selectedStatus}
						onValueChange={handleStatusChange}
						variant="default"
					>
						<ToggleGroupItem value="all" aria-label="Exibir todos">
							Todos
						</ToggleGroupItem>
						<ToggleGroupItem
							value="active"
							aria-label="Exibir ativos"
						>
							Ativos
						</ToggleGroupItem>
						<ToggleGroupItem
							value="inactive"
							aria-label="Exibir inativos"
						>
							Inativos
						</ToggleGroupItem>
					</ToggleGroup>
				</div>
			</div>

			{/* Results */}
			{filteredScholars.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{filteredScholars.map((scholar) => (
						<ScholarCard key={scholar.user.id} scholar={scholar} />
					))}
				</div>
			) : (
				<StatusMessage
					className="my-48 lg:max-w-2/3 mx-auto"
					title="Nenhum bolsista encontrado"
					description="Ajuste a busca ou os filtros para encontrar bolsistas ou aguarde por novos registros."
					icon={<Frown className="size-8" />}
				/>
			)}
		</>
	);
}
