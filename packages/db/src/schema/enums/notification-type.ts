import { notificationTypeValues } from "@mobiliza/contracts";
import { pgEnum } from "drizzle-orm/pg-core";

export const notificationTypeEnum = pgEnum(
	"notification_type",
	notificationTypeValues,
);
