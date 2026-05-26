export const disabilityTypeValues = [
    "physical_disability",
    "reduced_mobility",
    "blindness",
    "low_vision",
    "deafness",
    "hard_of_hearing",
    "deafblindness",
    "other",
] as const;

export const studentShiftValues = [
    "morning",
    "afternoon",
    "night",
    "full_day",
] as const;

export const scholarShiftValues = ["morning", "afternoon", "night"] as const;

export const genderValues = [
    "male",
    "female",
    "non_binary",
    "prefer_not_to_say",
] as const;

export const requestStatusValues = [
    "pending",
    "accepted",
    "ongoing",
    "completed",
    "cancelled",
    "unattended",
] as const;

export const notificationTypeValues = [
    "request_accepted",
    "request_unattended",
    "attendance_started",
    "attendance_completed",
    "scholar_approved",
    "scholar_rejected",
    "new_request_available",
] as const;