import { z } from 'zod';

export const AccessibilitySchema = z.object({
  disabilityType: z.array(z.string()).min(1, 'Selecione pelo menos uma opção'),
  needsAudioDescription: z.boolean(),
});

export type AccessibilityInput = z.infer<typeof AccessibilitySchema>;