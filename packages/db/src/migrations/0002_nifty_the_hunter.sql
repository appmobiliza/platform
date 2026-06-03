CREATE TYPE "public"."role" AS ENUM('student', 'scholar', 'manager');--> statement-breakpoint
ALTER TABLE "scholar_profile" DROP CONSTRAINT "scholar_profile_approved_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('request_accepted', 'request_unattended', 'attendance_started', 'attendance_completed', 'new_request_available');--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'student'::"public"."role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "scholar_profile" ALTER COLUMN "campus" SET DATA TYPE "public"."campus" USING "campus"::"public"."campus";--> statement-breakpoint
ALTER TABLE "scholar_profile" ADD COLUMN "gender" "gender" NOT NULL;--> statement-breakpoint
ALTER TABLE "scholar_profile" DROP COLUMN "is_approved";--> statement-breakpoint
ALTER TABLE "scholar_profile" DROP COLUMN "approved_at";--> statement-breakpoint
ALTER TABLE "scholar_profile" DROP COLUMN "approved_by";