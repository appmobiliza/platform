CREATE TYPE "public"."campus" AS ENUM('Campus A.C. Simões', 'Campus CECA', 'Campus Arapiraca', 'Campus Sertão');--> statement-breakpoint
CREATE TYPE "public"."course" AS ENUM('Administração', 'Administração Pública', 'Agroecologia', 'Agronomia', 'Arquitetura e Urbanismo', 'Biblioteconomia', 'Ciência da Computação', 'Ciências Biológicas', 'Ciências Contábeis', 'Ciências Econômicas', 'Ciências Sociais', 'Ciências: Biologia, Física e Química', 'Comunicação Social (Jornalismo)', 'Comunicação Social (Relações Públicas)', 'Dança', 'Design', 'Direito', 'Educação Física', 'Enfermagem', 'Engenharia Ambiental e Sanitária', 'Engenharia Civil', 'Engenharia de Agrimensura', 'Engenharia de Computação', 'Engenharia de Energia', 'Engenharia de Pesca', 'Engenharia de Petróleo', 'Engenharia de Produção', 'Engenharia Elétrica', 'Engenharia Florestal', 'Engenharia Química', 'Farmácia', 'Filosofia', 'Física', 'Geografia', 'História', 'Inteligência Artificial', 'Jornalismo', 'Letras', 'Letras (Espanhol)', 'Letras (Francês)', 'Letras (Inglês)', 'Letras (Português)', 'Letras Libras', 'Matemática', 'Medicina', 'Medicina Veterinária', 'Meteorologia', 'Música', 'Música (Canto)', 'Nutrição', 'Odontologia', 'Pedagogia', 'Psicologia', 'Química', 'Química Tecnológica e Industrial', 'Relações Públicas', 'Serviço Social', 'Sistemas de Informação', 'Teatro', 'Turismo', 'Zootecnia');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');--> statement-breakpoint
CREATE TYPE "public"."disability_type" AS ENUM('physical_disability', 'reduced_mobility', 'blindness', 'low_vision', 'deafness', 'hard_of_hearing', 'deafblindness', 'other');--> statement-breakpoint
CREATE TYPE "public"."extra_shift_reason" AS ENUM('illness', 'appointment', 'personal', 'other');--> statement-breakpoint
CREATE TYPE "public"."extra_shift_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non_binary', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('request_accepted', 'request_unattended', 'attendance_started', 'attendance_completed', 'new_request_available');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'accepted', 'ongoing', 'completed', 'cancelled', 'unattended');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'scholar', 'manager');--> statement-breakpoint
CREATE TYPE "public"."scholar_shift" AS ENUM('morning', 'afternoon', 'night');--> statement-breakpoint
CREATE TYPE "public"."student_shift" AS ENUM('morning', 'afternoon', 'night', 'full_day');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" "role" DEFAULT 'student' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audio_message" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"audio_url" text NOT NULL,
	"duration_seconds" integer,
	"transcription" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"resource_id" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campus_location" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"abbreviation" text NOT NULL,
	"description" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_route" (
	"id" text PRIMARY KEY NOT NULL,
	"student_profile_id" text NOT NULL,
	"origin_location_id" text NOT NULL,
	"destination_location_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extra_shift_request" (
	"id" text PRIMARY KEY NOT NULL,
	"scholar_profile_id" text NOT NULL,
	"date" date NOT NULL,
	"shift" "scholar_shift" NOT NULL,
	"reason" "extra_shift_reason" NOT NULL,
	"custom_reason" text,
	"status" "extra_shift_request_status" DEFAULT 'pending' NOT NULL,
	"approved_by_id" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "extra_shift_request_scholar_profile_id_date_shift_unique" UNIQUE("scholar_profile_id","date","shift")
);
--> statement-breakpoint
CREATE TABLE "scholar_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"enrollment" text NOT NULL,
	"campus" "campus" NOT NULL,
	"phone" text NOT NULL,
	"gender" "gender" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"course" text NOT NULL,
	"shift" "scholar_shift" NOT NULL,
	"cpf" text NOT NULL,
	"is_available" boolean DEFAULT false NOT NULL,
	CONSTRAINT "scholar_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "scholar_profile_enrollment_unique" UNIQUE("enrollment"),
	CONSTRAINT "scholar_profile_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "scholar_weekly_schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"scholar_profile_id" text NOT NULL,
	"day_of_week" "day_of_week" NOT NULL,
	"shift" "scholar_shift" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scholar_weekly_schedule_scholar_profile_id_day_of_week_shift_unique" UNIQUE("scholar_profile_id","day_of_week","shift")
);
--> statement-breakpoint
CREATE TABLE "student_disability" (
	"id" text PRIMARY KEY NOT NULL,
	"student_profile_id" text NOT NULL,
	"disability_type" "disability_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_disability_student_profile_id_disability_type_unique" UNIQUE("student_profile_id","disability_type")
);
--> statement-breakpoint
CREATE TABLE "student_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"enrollment" text NOT NULL,
	"campus" "campus" NOT NULL,
	"phone" text NOT NULL,
	"gender" "gender" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"course" "course" NOT NULL,
	"shift" "student_shift" NOT NULL,
	"nickname" text,
	"attendance_notes" text,
	"simplified_interface" boolean DEFAULT false NOT NULL,
	CONSTRAINT "student_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "student_profile_enrollment_unique" UNIQUE("enrollment")
);
--> statement-breakpoint
CREATE TABLE "service_attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"scholar_profile_id" text NOT NULL,
	"accepted_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_seconds" integer,
	"rating" integer,
	"rating_comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_attendance_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "service_request" (
	"id" text PRIMARY KEY NOT NULL,
	"student_profile_id" text NOT NULL,
	"origin_location_id" text NOT NULL,
	"destination_location_id" text NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_message" ADD CONSTRAINT "audio_message_request_id_service_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."service_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_route" ADD CONSTRAINT "favorite_route_student_profile_id_student_profile_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_route" ADD CONSTRAINT "favorite_route_origin_location_id_campus_location_id_fk" FOREIGN KEY ("origin_location_id") REFERENCES "public"."campus_location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_route" ADD CONSTRAINT "favorite_route_destination_location_id_campus_location_id_fk" FOREIGN KEY ("destination_location_id") REFERENCES "public"."campus_location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extra_shift_request" ADD CONSTRAINT "extra_shift_request_scholar_profile_id_scholar_profile_id_fk" FOREIGN KEY ("scholar_profile_id") REFERENCES "public"."scholar_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extra_shift_request" ADD CONSTRAINT "extra_shift_request_approved_by_id_user_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholar_profile" ADD CONSTRAINT "scholar_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholar_weekly_schedule" ADD CONSTRAINT "scholar_weekly_schedule_scholar_profile_id_scholar_profile_id_fk" FOREIGN KEY ("scholar_profile_id") REFERENCES "public"."scholar_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_disability" ADD CONSTRAINT "student_disability_student_profile_id_student_profile_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_attendance" ADD CONSTRAINT "service_attendance_request_id_service_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."service_request"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_attendance" ADD CONSTRAINT "service_attendance_scholar_profile_id_scholar_profile_id_fk" FOREIGN KEY ("scholar_profile_id") REFERENCES "public"."scholar_profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_student_profile_id_student_profile_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_origin_location_id_campus_location_id_fk" FOREIGN KEY ("origin_location_id") REFERENCES "public"."campus_location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_destination_location_id_campus_location_id_fk" FOREIGN KEY ("destination_location_id") REFERENCES "public"."campus_location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");