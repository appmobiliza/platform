import { insertStudentSchema } from "@mobiliza/contracts";

import { z } from "zod";

export const ProfileCourseSchema = insertStudentSchema.pick({ course: true });

export const ProfileStudentShiftSchema = insertStudentSchema.pick({ shift: true });

export const ProfileCampusSchema = insertStudentSchema.pick({ campus: true });

export const ProfileEnrollmentSchema = insertStudentSchema.pick({
	enrollment: true,
});

export const CourseInfoSchema = z.object({
	...ProfileCourseSchema.shape,
	...ProfileStudentShiftSchema.shape,
	...ProfileCampusSchema.shape,
	...ProfileEnrollmentSchema.shape,
});

export type ProfileCourseInput = z.infer<typeof ProfileCourseSchema>;
export type ProfileStudentShiftInput = z.infer<
	typeof ProfileStudentShiftSchema
>;
export type ProfileCampusInput = z.infer<typeof ProfileCampusSchema>;
export type ProfileEnrollmentInput = z.infer<typeof ProfileEnrollmentSchema>;
export type CourseInfoInput = z.infer<typeof CourseInfoSchema>;
