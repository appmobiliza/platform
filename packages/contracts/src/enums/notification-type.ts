export const notificationTypeValues = [
	"request_accepted",
	"request_unattended",
	"attendance_started",
	"attendance_completed",
	"new_request_available",
] as const;

export type NotificationTypeValues = (typeof notificationTypeValues)[number];
