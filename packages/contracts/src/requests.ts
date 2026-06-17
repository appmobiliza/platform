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

/**
 * Schema for a route point collected during attendance.
 * Each point is [longitude, latitude, unix_timestamp_ms].
 */
export const RoutePointSchema = z.tuple([
	z.number(), // longitude
	z.number(), // latitude
	z.number(), // unix timestamp in milliseconds
]);

/**
 * Schema for the complete route in GeoJSON LineString format.
 * Used to store the path traveled by the scholar during attendance.
 */
export const RouteGeojsonSchema = z.object({
	type: z.literal("LineString"),
	coordinates: z.array(RoutePointSchema).min(1, "Rota deve ter ao menos 1 ponto"),
});

/**
 * Schema for completing an attendance with route data.
 * Extends RequestIdSchema with the collected route and derived metrics.
 */
export const CompleteAttendanceSchema = RequestIdSchema.extend({
	/**
	 * GeoJSON LineString with the route traveled.
	 * Coordinates are [lng, lat, unix_ms] — simplified with RDP before sending.
	 */
	routeGeojson: RouteGeojsonSchema.optional(),

	/**
	 * Total distance in meters, calculated from the raw (non-simplified) points.
	 * If omitted, the server will calculate it from the route points.
	 */
	distanceMeters: z.number().int().positive().optional(),
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
