import type { AppRouter } from "@mobiliza/api/router";

export type ApiDate = Date | string;

/**
 * Tipo derivado diretamente da procedure `requests.managerList` através
 * do caller em vez de `inferRouterOutputs`. Isso preserva os tipos `Date`
 * originais do banco, já que o caller in-process não serializa para HTTP.
 */
type Caller = ReturnType<AppRouter["createCaller"]>;
type ManagerListOutput = Awaited<
	ReturnType<Caller["requests"]["managerList"]>
>;
export type ManagerRequest = ManagerListOutput[number];

export type ServiceStatus =
	| "concluded"
	| "in_progress"
	| "not_attended";

type AttendanceWithRelations = NonNullable<ManagerRequest["attendance"]>;

export type ServiceEntry = {
	id: ManagerRequest["id"];
	date: string;
	duration: string;
	notes: string;
	route: string;
	status: ServiceStatus;
	time: string;
	student: {
		user: ManagerRequest["studentProfile"]["user"];
		profile: ManagerRequest["studentProfile"];
	};
	scholar: {
		user: AttendanceWithRelations["scholarProfile"]["user"];
		profile: AttendanceWithRelations["scholarProfile"];
	} | null;
};

export function getCurrentMonthRange() {
	const now = new Date();
	const from = new Date(now.getFullYear(), now.getMonth(), 1);
	const to = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
		23,
		59,
		59,
		999,
	);

	return {
		from: from.toISOString(),
		to: to.toISOString(),
	};
}

export function getTodayRange() {
	const from = new Date();
	from.setHours(0, 0, 0, 0);

	const to = new Date();
	to.setHours(23, 59, 59, 999);

	return {
		from: from.toISOString(),
		to: to.toISOString(),
	};
}

export function toDate(value: ApiDate) {
	return value instanceof Date ? value : new Date(value);
}

export function getRouteLabel(
	request: Pick<ManagerRequest, "originLocation" | "destinationLocation">,
) {
	const origin =
		request.originLocation.abbreviation || request.originLocation.name;
	const destination =
		request.destinationLocation.abbreviation ||
		request.destinationLocation.name;

	return `${origin} → ${destination}`;
}

export function formatDate(value: ApiDate) {
	return toDate(value).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
	});
}

export function formatTime(value: ApiDate) {
	return toDate(value)
		.toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		})
		.replace(":", "h");
}

export function formatDuration(seconds: number | null | undefined) {
	if (!seconds) {
		return "-";
	}

	const minutes = Math.max(1, Math.round(seconds / 60));
	return `${minutes} min`;
}

export function formatDurationShort(seconds: number | null | undefined) {
	if (!seconds) {
		return "-";
	}

	const minutes = Math.max(1, Math.round(seconds / 60));
	return `${minutes}m`;
}

export function getServiceStatus(
	status: ManagerRequest["status"],
): ServiceStatus {
	if (status === "completed") {
		return "concluded";
	}

	if (status === "cancelled" || status === "unattended") {
		return "not_attended";
	}

	return "in_progress";
}

export function mapRequestToServiceEntry(
	request: ManagerRequest,
): ServiceEntry {
	const attendance = request.attendance;

	return {
		id: request.id,
		date: formatDate(request.createdAt),
		duration:
			request.status === "ongoing" || request.status === "accepted"
				? "em andamento"
				: formatDuration(attendance?.durationSeconds),
		notes: request.notes ?? "",
		route: getRouteLabel(request),
		status: getServiceStatus(request.status),
		student: {
			user: request.studentProfile.user,
			profile: request.studentProfile,
		},
		scholar: attendance?.scholarProfile
			? {
				user: attendance.scholarProfile.user,
				profile: attendance.scholarProfile,
			}
			: null,
		time: formatTime(request.createdAt),
	};
}

export function countBy<T>(items: T[], getKey: (item: T) => string) {
	const counts = new Map<string, number>();

	for (const item of items) {
		const key = getKey(item);
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}

	return Array.from(counts.entries())
		.map(([name, count]) => ({ name, count }))
		.sort((itemA, itemB) => itemB.count - itemA.count);
}
