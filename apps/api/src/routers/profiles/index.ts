import { router } from "@mobiliza/trpc";

import { me } from "./me";
import { createScholar } from "./scholar/createScholar";
import { getExtraShiftRequests } from "./scholar/getExtraShiftRequests";
import { getSchedules } from "./scholar/getSchedules";
import { requestExtraShift } from "./scholar/requestExtraShift";
import { reviewExtraShiftRequest } from "./scholar/reviewExtraShiftRequest";
import { scholarDashboard } from "./scholar/scholarDashboard";
import { scholarWeeklySchedule } from "./scholar/scholarWeeklySchedule";
import { toggleAvailability } from "./scholar/toggleAvailability";
import { updateScholarSchedule } from "./scholar/updateScholarSchedule";
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
	scholarWeeklySchedule,
	getSchedules,
	updateScholarSchedule,
	requestExtraShift,
	getExtraShiftRequests,
	reviewExtraShiftRequest,
});
