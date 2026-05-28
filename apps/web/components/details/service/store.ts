"use client";

import { createDetailsStore } from "@/components/details/details-store";

import type { ServiceEntry } from "@/data/services-data";

const serviceDetailsStore = createDetailsStore<ServiceEntry>();

export const openServiceDetails = serviceDetailsStore.openDetails;
export const closeServiceDetails = serviceDetailsStore.closeDetails;
export const useServiceDetailsEntry = serviceDetailsStore.useDetailsState;
