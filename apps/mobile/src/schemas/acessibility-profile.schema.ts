import { InsertStudentSchema } from "@mobiliza/contracts";

import { z } from "zod";

export const ProfileDisabilitiesSchema = InsertStudentSchema.pick({ disabilityTypes: true });

export const ProfileObservationSchema = InsertStudentSchema.pick({ attendanceNotes: true });

export const ProfileSimplifiedInterfaceSchema = InsertStudentSchema.pick({ simplifiedInterface: true });

export const ProfileAccessibilitySchema = z.object({
	...ProfileDisabilitiesSchema.shape,
	...ProfileSimplifiedInterfaceSchema.shape,
});

export type ProfileDisabilitiesInput = z.infer<
	typeof ProfileDisabilitiesSchema
>;
export type ProfileObservationInput = z.infer<typeof ProfileObservationSchema>;
export type ProfileSimplifiedInterfaceInput = z.infer<
	typeof ProfileSimplifiedInterfaceSchema
>;

export type ProfileAccessibilityInput = z.infer<
	typeof ProfileAccessibilitySchema
>;
