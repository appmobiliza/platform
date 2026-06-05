export const extraShiftReasonValues = [
	"illness",
	"appointment",
	"personal",
	"other",
] as const;

export type ExtraShiftReasonValues = (typeof extraShiftReasonValues)[number];

export const extraShiftReasonLabels: Record<ExtraShiftReasonValues, string> = {
	illness: "Doença",
	appointment: "Compromisso",
	personal: "Motivo pessoal",
	other: "Outro",
};
