import { router } from "@mobiliza/trpc";

import { me } from "./me.js";
import { createScholarAsManager } from "./scholar/createScholarAsManager.js";
import { getExtraShiftRequests } from "./scholar/getExtraShiftRequests.js";
import { getSchedules } from "./scholar/getSchedules.js";
import { requestExtraShift } from "./scholar/requestExtraShift.js";
import { reviewExtraShiftRequest } from "./scholar/reviewExtraShiftRequest.js";
import { scholarDashboard } from "./scholar/scholarDashboard.js";
import { scholarWeeklySchedule } from "./scholar/scholarWeeklySchedule.js";
import { toggleAvailability } from "./scholar/toggleAvailability.js";
import { updateScholar } from "./scholar/updateScholar.js";
import { updateScholarAsManager } from "./scholar/updateScholarAsManager.js";
import { updateScholarSchedule } from "./scholar/updateScholarSchedule.js";
import { createStudent } from "./student/createStudent.js";
import { studentDashboard } from "./student/studentDashboard.js";
import { updateStudent } from "./student/updateStudent.js";

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
