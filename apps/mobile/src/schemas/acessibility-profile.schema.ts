import { disabilityTypeValues } from "@mobiliza/contracts";
import { z } from "zod";

export const ProfileDisabilitiesSchema = z.object({
	disabilities: z.array(z.enum(disabilityTypeValues))
});

export const ProfileObservationSchema = z.object({
	observation: z.string(),
});

export const ProfileSimplifiedInterfaceSchema = z.object({
	simplifiedInterface: z.boolean(),
});

export const ProfileAccessibilitySchema = z.object({
	...ProfileDisabilitiesSchema.shape,
	...ProfileSimplifiedInterfaceSchema.shape,
});

export type ProfileDisabilitiesInput = z.infer<typeof ProfileDisabilitiesSchema>;
export type ProfileObservationInput = z.infer<typeof ProfileObservationSchema>;
export type ProfileSimplifiedInterfaceInput = z.infer<typeof ProfileSimplifiedInterfaceSchema>;
export type ProfileAccessibilityInput = z.infer<typeof ProfileAccessibilitySchema>;
