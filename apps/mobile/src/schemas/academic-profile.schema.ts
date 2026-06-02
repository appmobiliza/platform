import { campusValues, courseValues, studentShiftValues } from "@mobiliza/db/schema";
import { z } from "zod";

import { validateEnrollment } from "@/utils";

export const ProfileCourseSchema = z.object({
	course: z.enum(courseValues),
});

export const ProfileStudentShiftSchema = z.object({
	studentShift: z.enum(studentShiftValues),
});

export const ProfileCampusSchema = z.object({
	campus: z.enum(campusValues)
});

export const ProfileEnrollmentSchema = z.object({
	enrollment: z.string().refine(validateEnrollment, "Matrícula inválida"),
});

export const CourseInfoSchema = ProfileCourseSchema
	.merge(ProfileStudentShiftSchema)
	.merge(ProfileCampusSchema)
	.merge(ProfileEnrollmentSchema);

export type ProfileCourseInput = z.infer<typeof ProfileCourseSchema>;
export type ProfileStudentShiftInput = z.infer<typeof ProfileStudentShiftSchema>;
export type ProfileCampusInput = z.infer<typeof ProfileCampusSchema>;
export type ProfileEnrollmentInput = z.infer<typeof ProfileEnrollmentSchema>;
export type CourseInfoInput = z.infer<typeof CourseInfoSchema>;
