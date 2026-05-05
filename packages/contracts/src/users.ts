export type UserRole = "student" | "assistant" | "manager";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface StudentProfile extends UserProfile {
  role: "student";
  course: string;
  disabilityProfile: string;
}

export interface AssistantProfile extends UserProfile {
  role: "assistant";
  shift: "morning" | "afternoon" | "night";
  isAvailable: boolean;
}