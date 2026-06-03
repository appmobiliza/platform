export const roleValues = ["student", "scholar", "manager"] as const;

export type RoleValues = (typeof roleValues)[number];
