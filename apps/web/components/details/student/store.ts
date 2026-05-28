"use client";

import { createDetailsStore } from "@/components/details/details-store";

import type { StudentData } from "@/data/students-data";

const studentDetailsStore = createDetailsStore<StudentData>();

export const openStudentDetails = studentDetailsStore.openDetails;
export const closeStudentDetails = studentDetailsStore.closeDetails;
export const useStudentDetailsEntry = studentDetailsStore.useDetailsState;
