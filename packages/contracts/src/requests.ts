import { z } from "zod";

import { requestStatusValues } from "./enums/request-status";

export const CreateRequestSchema = z.object({
	originLocationId: z.string(),
	destinationLocationId: z.string(),
	notes: z.string().max(500).optional(),
});

export const PaginationSchema = z.object({
	limit: z.number().int().min(1).max(50).default(20),
	cursor: z.string().optional(),
});

export const RequestIdSchema = z.object({
	requestId: z.string(),
});

export const RateRequestSchema = z.object({
	requestId: z.string(),
	rating: z.number().int().min(1).max(5),
	comment: z.string().max(500).optional(),
});

export const ServiceRequestSchema = z.object({
	id: z.string(),
	studentProfileId: z.string(),
	originLocationId: z.string(),
	destinationLocationId: z.string(),
	status: z.enum(requestStatusValues),
	notes: z.string().nullable().optional(),
	respondedAt: z.date().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});
