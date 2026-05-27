"use client";

import { createDetailsStore } from "@/components/details-store";
import type { ScholarData } from "@/components/scholars-data";

const scholarDetailsStore = createDetailsStore<ScholarData>();

export const openScholarDetails = scholarDetailsStore.openDetails;
export const closeScholarDetails = scholarDetailsStore.closeDetails;
export const useScholarDetailsEntry = scholarDetailsStore.useDetailsState;
