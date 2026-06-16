"use client";

import { createDetailsStore } from "@/components/details/details-store";

import type { CachedScholar } from "@/lib/cached-data";

const scholarDetailsStore = createDetailsStore<CachedScholar>();

export const openScholarDetails = scholarDetailsStore.openDetails;
export const closeScholarDetails = scholarDetailsStore.closeDetails;
export const updateScholarDetails = scholarDetailsStore.updateItem;
export const useScholarDetailsEntry = scholarDetailsStore.useDetailsState;
