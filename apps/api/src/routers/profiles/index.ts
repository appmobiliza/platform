import { router } from "@/trpc/context";
import { me } from "./me";
import { createScholar } from "./scholar/createScholar";
import { scholarDashboard } from "./scholar/scholarDashboard";
import { toggleAvailability } from "./scholar/toggleAvailability";
import { createStudent } from "./student/createStudent";
import { studentDashboard } from "./student/studentDashboard";

/**
 * Router de perfis modularizado.
 * Agrega todos os procedimentos da pasta profiles/.
 */
export const profilesRouter = router({
	me,
	createStudent,
	createScholar,
	toggleAvailability,
	scholarDashboard,
	studentDashboard,
});
