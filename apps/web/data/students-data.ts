import type { AppRouter } from "@mobiliza/api/router";
import type { RequestStatusValues } from "@mobiliza/contracts";

/**
 * Tipo derivado diretamente da procedure `profiles.studentDashboard` através
 * do caller em vez de `inferRouterOutputs`. Isso preserva os tipos `Date`
 * originais do banco, já que o caller in-process não serializa para HTTP.
 */
type Caller = ReturnType<AppRouter["createCaller"]>;
type StudentDashboardOutput = Awaited<
	ReturnType<Caller["profiles"]["studentDashboard"]>
>;
export type StudentData = StudentDashboardOutput["students"][number];

export function getStudentRouteStatus(
	status: RequestStatusValues,
): "completed" | "pending" | "canceled" {
	if (status === "completed") {
		return "completed";
	}

	if (status === "cancelled" || status === "unattended") {
		return "canceled";
	}

	return "pending";
}
