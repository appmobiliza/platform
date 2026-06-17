/**
 * Date formatting utilities for Portuguese locale.
 */

const monthNames = [
	"janeiro",
	"fevereiro",
	"março",
	"abril",
	"maio",
	"junho",
	"julho",
	"agosto",
	"setembro",
	"outubro",
	"novembro",
	"dezembro",
] as const;

const monthAbbrNames = [
	"jan",
	"fev",
	"mar",
	"abr",
	"mai",
	"jun",
	"jul",
	"ago",
	"set",
	"out",
	"nov",
	"dez",
] as const;

/**
 * Format a date as "1 de agosto"
 */
export function formatDateLong(date: Date): string {
	return `${date.getDate()} de ${monthNames[date.getMonth()]}`;
}

/**
 * Format a date as "1 de agosto • 19h00"
 */
export function formatDateTime(date: Date): string {
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	return `${formatDateLong(date)} • ${hours}h${minutes}`;
}

/**
 * Format a date as "19h00" (time only)
 */
export function formatTime(date: Date): string {
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	return `${hours}h${minutes}`;
}

/**
 * Format a time range like "18:00 - 18:23"
 */
export function formatTimeRange(start: Date, end: Date): string {
	const fmt = (d: Date) =>
		`${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
	return `${fmt(start)} - ${fmt(end)}`;
}

/**
 * Format a date ISO string as abbreviated month/year, e.g. "mar/2025"
 */
export function formatShortDate(isoString: string | null): string {
	if (!isoString) return "";
	try {
		const date = new Date(isoString);
		const month = monthAbbrNames[date.getMonth()];
		const year = date.getFullYear();
		return `${month}/${year}`;
	} catch {
		return "";
	}
}

/**
 * Get a date key for grouping (YYYY-MM-DD)
 */
export function getDateKey(date: Date): string {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

export function formatRelativeDate(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const time = `${hours}h${minutes}`;

	if (diffDays === 0) return `Hoje, ${time}`;
	if (diffDays === 1) return `Ontem, ${time}`;
	return `Há ${diffDays} dias, ${time}`;
}
