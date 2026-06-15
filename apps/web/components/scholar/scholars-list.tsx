"use client";

import { Frown, Search, XIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ScholarCard } from "@/components/scholar/scholar-card";
import { StatusMessage } from "@/components/status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { useDebounce } from "@/hooks/use-debounce";

import type { CachedScholar } from "@/lib/cached-data";

// ─── Helpers ────────────────────────────────────────────────────────────

type StatusFilter = "all" | "active" | "inactive";

function matchesStatus(scholar: CachedScholar, filter: StatusFilter): boolean {
	if (filter === "all") return true;
	return filter === "active"
		? scholar.profile.isActive
		: !scholar.profile.isActive;
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
	const debouncedQuery = useDebounce(rawQuery, 250);

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
			if (!query) return true;

			return [
				scholar.user.name,
				scholar.profile.enrollment,
				scholar.profile.course,
				scholar.profile.campus,
			].some((value) => value.toLowerCase().includes(query));
		});
	}, [initialData.scholars, debouncedQuery, selectedStatus]);

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
