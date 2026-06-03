export const requestStatusValues = [
	"pending",
	"accepted",
	"ongoing",
	"completed",
	"cancelled",
	"unattended",
] as const;

export type RequestStatusValues = (typeof requestStatusValues)[number];
