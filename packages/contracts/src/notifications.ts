import { z } from "zod";

export const NotificationListSchema = z.object({
	limit: z.number().int().min(1).max(50).default(20),
	cursor: z.string().optional(),
	onlyUnread: z.boolean().default(false),
});

export const MarkReadSchema = z.object({
	notificationId: z.string().optional(), // se omitido, marca todas como lidas
});
