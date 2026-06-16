import { getCurrentShiftFromDefinitions, type ScholarShiftValues } from "@mobiliza/contracts";

import { useMemo } from "react";

import { useUser } from "@/lib/auth/store";
import { trpc } from "@/lib/trpc/client";

// ─── Tipos locais (compatíveis com o retorno da API) ─────────────────────────

interface ShiftDefinition {
	shift: string;
	dayOfWeek: string;
	startTime: string;
	endTime: string;
	isEnabled: boolean;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShiftState = "not_in_shift" | "shift_not_started" | "shift_active";

export interface CurrentShiftInfo {
	label: string;
	time: string;
}

export interface UseShiftStateReturn {
	/** Estado atual do turno */
	shiftState: ShiftState;
	/** Informações do turno atual (exibidas no ShiftPill) */
	currentShiftInfo: CurrentShiftInfo | null;
	/** Nome do bolsista (primeiro nome) */
	scholarName: string;
	/** Se as queries de turno estão carregando */
	isLoadingShift: boolean;
	/** Dados do turno ativo, se houver */
	activeShiftLog: Record<string, any> | null | undefined;
	/** Dados do perfil do usuário */
	me: Record<string, any> | null | undefined;
	/** Definições de turno */
	shiftSchedule: ShiftDefinition[];
	/** Turno atual baseado no horário agendado (só definido se dentro da janela) */
	currentShift: {
		shift: ScholarShiftValues;
		startTime: string;
		endTime: string;
	} | null;
}

// ─── Labels em português ─────────────────────────────────────────────────────

const shiftLabels: Record<string, string> = {
	morning: "Turno matutino",
	afternoon: "Turno vespertino",
	night: "Turno noturno",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimeRange(startTime: string, endTime: string): string {
	const fmt = (t: string) => {
		const [h, m] = t.split(":");
		return `${h}h${m !== "00" ? m : ""}`;
	};
	return `${fmt(startTime)} - ${fmt(endTime)}`;
}

/**
 * Retorna o nome do dia da semana em inglês (compatível com o backend).
 */
const dayNames = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
];

function getCurrentDayName(): string {
	return dayNames[new Date().getDay()]!;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Hook compartilhado que determina o estado do turno e as informações
 * exibidas no cabeçalho do bolsista (ScholarHeader).
 *
 * Lida com os seguintes cenários:
 * - Fora do turno (não há turno ativo nem horário de turno agora)
 * - Turno não iniciado (dentro do horário agendado, mas sem activeShiftLog)
 * - Turno ativo (activeShiftLog presente, mesmo que fora da janela agendada)
 */
export function useShiftState(): UseShiftStateReturn {
	const user = useUser();
	const { data: me } = trpc.profiles.me.useQuery();
	const { data: shiftSchedule = [] } =
		trpc.settings.getShiftSchedule.useQuery();
	const { data: activeShiftLog, isLoading: isLoadingShift } =
		trpc.shiftLogs.getActiveShift.useQuery();

	const scholarName = useMemo(() => {
		return (
			user.name?.split(" ")[0] ?? me?.name?.split(" ")[0] ?? "Bolsista"
		);
	}, [user.name, me?.name]);

	// Turno baseado no horário agendado (só retorna valor se estivermos
	// dentro da janela do turno de acordo com a escala)
	const currentShift = useMemo(
		() =>
			getCurrentShiftFromDefinitions(
				shiftSchedule as any[],
			),
		[shiftSchedule],
	);

	// Estado do turno:
	// - Se existe activeShiftLog → shift_active (mesmo que a janela agendada já tenha passado)
	// - Se não, se currentShift não é null → shift_not_started (dentro da janela)
	// - Senão → not_in_shift
	const shiftState: ShiftState = useMemo(() => {
		if (activeShiftLog) return "shift_active";
		if (currentShift) return "shift_not_started";
		return "not_in_shift";
	}, [activeShiftLog, currentShift]);

	// Informações do turno atual para o ShiftPill.
	// Prioriza o turno da schedule, mas cai no activeShiftLog se o
	// bolsista estiver em turno ativo e a janela agendada já passou.
	const currentShiftInfo: CurrentShiftInfo | null = useMemo(() => {
		if (currentShift) {
			return {
				label: shiftLabels[currentShift.shift] ?? currentShift.shift,
				time: formatTimeRange(
					currentShift.startTime,
					currentShift.endTime,
				),
			};
		}

		// Se o bolsista tem um turno ativo mas está fora da janela agendada
		// (ex.: começou às 7h, são 12h30 e o turno matutino vai até 12h),
		// ainda assim exibimos o ShiftPill com as informações do turno.
		if (activeShiftLog?.shift) {
			const day = getCurrentDayName();
			const def = (shiftSchedule as ShiftDefinition[]).find(
				(d) =>
					d.dayOfWeek === day &&
					d.shift === activeShiftLog.shift &&
					d.isEnabled,
			);

			if (def) {
				return {
					label:
						shiftLabels[activeShiftLog.shift] ??
						activeShiftLog.shift,
					time: formatTimeRange(def.startTime, def.endTime),
				};
			}

			// Fallback: mostra apenas o label sem horário
			return {
				label:
					shiftLabels[activeShiftLog.shift] ?? activeShiftLog.shift,
				time: "",
			};
		}

		return null;
	}, [currentShift, activeShiftLog, shiftSchedule]);

	return {
		shiftState,
		currentShiftInfo,
		scholarName,
		isLoadingShift,
		activeShiftLog,
		me,
		shiftSchedule,
		currentShift,
	};
}
