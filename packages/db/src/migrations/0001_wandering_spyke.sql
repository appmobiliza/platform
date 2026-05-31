ALTER TABLE "student_profile" ALTER COLUMN "course" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."course";--> statement-breakpoint
CREATE TYPE "public"."course" AS ENUM('Administração', 'Administração Pública', 'Agroecologia', 'Agronomia', 'Arquitetura e Urbanismo', 'Biblioteconomia', 'Ciência da Computação', 'Ciências Biológicas', 'Ciências Contábeis', 'Ciências Econômicas', 'Ciências Sociais', 'Ciências: Biologia, Física e Química', 'Comunicação Social (Jornalismo)', 'Comunicação Social (Relações Públicas)', 'Dança', 'Design', 'Direito', 'Educação Física', 'Enfermagem', 'Engenharia Ambiental e Sanitária', 'Engenharia Civil', 'Engenharia de Agrimensura', 'Engenharia de Computação', 'Engenharia de Energia', 'Engenharia de Pesca', 'Engenharia de Petróleo', 'Engenharia de Produção', 'Engenharia Elétrica', 'Engenharia Florestal', 'Engenharia Química', 'Farmácia', 'Filosofia', 'Física', 'Geografia', 'História', 'Inteligência Artificial', 'Jornalismo', 'Letras', 'Letras (Espanhol)', 'Letras (Francês)', 'Letras (Inglês)', 'Letras (Português)', 'Letras Libras', 'Matemática', 'Medicina', 'Medicina Veterinária', 'Meteorologia', 'Música', 'Música (Canto)', 'Nutrição', 'Odontologia', 'Pedagogia', 'Psicologia', 'Química', 'Química Tecnológica e Industrial', 'Relações Públicas', 'Serviço Social', 'Sistemas de Informação', 'Teatro', 'Turismo', 'Zootecnia');--> statement-breakpoint
ALTER TABLE "student_profile" ALTER COLUMN "course" SET DATA TYPE "public"."course" USING "course"::"public"."course";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "campus_location" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "favorite_route" ALTER COLUMN "origin_location_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "favorite_route" ALTER COLUMN "destination_location_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "service_request" ALTER COLUMN "origin_location_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "service_request" ALTER COLUMN "destination_location_id" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");