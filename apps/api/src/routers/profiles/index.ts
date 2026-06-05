import { router } from "@mobiliza/trpc";

import { me } from "./me";
import { createScholarAsManager } from "./scholar/createScholarAsManager";
import { getExtraShiftRequests } from "./scholar/getExtraShiftRequests";
import { getSchedules } from "./scholar/getSchedules";
import { requestExtraShift } from "./scholar/requestExtraShift";
import { reviewExtraShiftRequest } from "./scholar/reviewExtraShiftRequest";
import { scholarDashboard } from "./scholar/scholarDashboard";
import { scholarWeeklySchedule } from "./scholar/scholarWeeklySchedule";
import { toggleAvailability } from "./scholar/toggleAvailability";
import { updateScholar } from "./scholar/updateScholar";
import { updateScholarAsManager } from "./scholar/updateScholarAsManager";
import { updateScholarSchedule } from "./scholar/updateScholarSchedule";
import { createStudent } from "./student/createStudent";
import { studentDashboard } from "./student/studentDashboard";
import { updateStudent } from "./student/updateStudent";

/**
 * Router de perfis modularizado.
 * Agrega todos os procedimentos da pasta profiles/.
 */
export const profilesRouter = router({
	me,
	createStudent,
	createScholarAsManager,
	updateScholarAsManager,
	updateScholar,
	toggleAvailability,
	scholarDashboard,
	studentDashboard,
	updateStudent,
	scholarWeeklySchedule,
	getSchedules,
	updateScholarSchedule,
	requestExtraShift,
	getExtraShiftRequests,
	reviewExtraShiftRequest,
});
