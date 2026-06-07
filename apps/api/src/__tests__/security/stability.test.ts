import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import {
	campusLocation,
	serviceRequest,
	studentProfile,
	user,
} from "@mobiliza/db/schema";
import type { ClientCredentials } from "@mobiliza/realtime";

import { describe, expect, jest, test } from "@jest/globals";
import { uuidv7 } from "uuidv7";

import { appRouter } from "../../router";
import { createMockTRPCContext } from "../mocks/context";

describe("Security/Stability: Realtime Outage", () => {
	test("create request should succeed even if realtime.publish fails", async () => {
		// 1. Setup mock data
		const uniqueId = uuidv7();
		const studentUser = await db
			.insert(user)
			.values({
				id: uniqueId,
				name: "Stability Student",
				email: `stability_${uniqueId}@test.com`,
				role: "student",
			})
			.returning()
			.then((r) => r[0]);

		const sProfile = await db
			.insert(studentProfile)
			.values({
				id: uniqueId,
				userId: studentUser.id,
				course: "Ciência da Computação",
				campus: "Campus A.C. Simões",
				shift: "morning",
				gender: "male",
				enrollment: `ENROLL_${uniqueId}`,
				phone: "82999999999",
			})
			.returning()
			.then((r) => r[0]);

		const loc1 = await db
			.insert(campusLocation)
			.values({
				id: `loc1_${uniqueId}`,
				name: "L1",
				abbreviation: "L1",
				latitude: 0,
				longitude: 0,
				isActive: true,
			})
			.returning()
			.then((r) => r[0]);

		const loc2 = await db
			.insert(campusLocation)
			.values({
				id: `loc2_${uniqueId}`,
				name: "L2",
				abbreviation: "L2",
				latitude: 1,
				longitude: 1,
				isActive: true,
			})
			.returning()
			.then((r) => r[0]);

		// 2. Mock context with FAILING realtime
		const ctx = createMockTRPCContext({
			session: {
				user: {
					id: studentUser.id,
					name: studentUser.name,
					email: studentUser.email,
					role: "student",
					image: null,
				},
				session: {
					id: "test-session-id",
					expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				},
			},
			realtime: {
				publish: jest.fn(async () => {
					throw new Error("Supabase is down!");
				}),
				subscribe: jest.fn(() => () => { }),
				unsubscribe: jest.fn(async () => { }),
				disconnect: jest.fn(async () => { }),
				getClientCredentials: jest.fn(
					async (): Promise<ClientCredentials> => ({
						provider: "ably",
						config: {},
					}),
				),
			},
		});

		const caller = appRouter.createCaller(ctx);

		// 3. Act
		const result = await caller.requests.create({
			originLocationId: loc1.id,
			destinationLocationId: loc2.id,
		});

		// 4. Assert
		// The request should be successful and return an ID despite the realtime error
		expect(result).toBeDefined();
		expect(result.id).toBeDefined();
		expect(result.status).toBe("pending");

		// Verify it was actually saved in DB
		const saved = await db.query.serviceRequest.findFirst({
			where: eq(serviceRequest.id, result.id),
		});
		expect(saved).toBeDefined();

		// Verify the mock was called
		expect(ctx.realtime.publish).toHaveBeenCalled();

		// Cleanup
		await db.delete(serviceRequest).where(eq(serviceRequest.id, result.id));
		await db
			.delete(studentProfile)
			.where(eq(studentProfile.id, sProfile.id));
		await db.delete(campusLocation).where(eq(campusLocation.id, loc1.id));
		await db.delete(campusLocation).where(eq(campusLocation.id, loc2.id));
		await db.delete(user).where(eq(user.id, studentUser.id));
	});
});
