import { insertStudentSchema } from "@mobiliza/contracts";

import { z } from "zod";

export const ProfileDisabilitiesSchema = insertStudentSchema.pick({ disabilityTypes: true });

export const ProfileObservationSchema = insertStudentSchema.pick({ attendanceNotes: true });

export const ProfileSimplifiedInterfaceSchema = insertStudentSchema.pick({ simplifiedInterface: true });

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
