export const extraShiftRequestStatusValues = [
	"pending",
	"approved",
	"rejected",
] as const;

export type ExtraShiftRequestStatusValues =
	(typeof extraShiftRequestStatusValues)[number];

export const extraShiftRequestStatusLabels: Record<
	ExtraShiftRequestStatusValues,
	string
> = {
	pending: "Pendente",
	approved: "Aprovado",
	rejected: "Rejeitado",
};
