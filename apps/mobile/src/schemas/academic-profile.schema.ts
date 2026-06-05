import { InsertStudentSchema } from "@mobiliza/contracts";

import { z } from "zod";

export const ProfileCourseSchema = InsertStudentSchema.pick({ course: true });

export const ProfileStudentShiftSchema = InsertStudentSchema.pick({ shift: true });

export const ProfileCampusSchema = InsertStudentSchema.pick({ campus: true });

export const ProfileEnrollmentSchema = InsertStudentSchema.pick({
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
