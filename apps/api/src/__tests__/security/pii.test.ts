import { test, expect, describe } from "@jest/globals";
import { appRouter } from "../../router";
import { db } from "@mobiliza/db/client";
import { user, studentProfile, scholarProfile, serviceRequest, campusLocation } from "@mobiliza/db/schema";
import { eq } from "@mobiliza/db/drizzle";

describe("Security: PII Leak in requests.available", () => {
  test("Available requests should not expose student email or full name", async () => {
    // 1. Setup mock data
    const studentUser = await db.insert(user).values({
      email: "student.pii@test.com",
      name: "Sensitive Student Name",
      id: "student-pii-1",
      role: "student"
    }).returning().then(r => r[0]);

    const sProfile = await db.insert(studentProfile).values({
      id: "sp-pii-1",
      userId: studentUser.id,
      course: "Ciência da Computação",
      campus: "Campus A.C. Simões",
      shift: "morning",
      gender: "prefer_not_to_say",
      enrollment: "123456",
      phone: "82999999999",
    }).returning().then(r => r[0]);

    const scholarUser = await db.insert(user).values({
      email: "scholar.pii@test.com",
      name: "Scholar",
      id: "scholar-pii-1",
      role: "scholar"
    }).returning().then(r => r[0]);

    await db.insert(scholarProfile).values({
      id: "scp-pii-1",
      userId: scholarUser.id,
      course: "Matemática",
      campus: "Campus A.C. Simões",
      shift: "morning",
      isApproved: true,
      isAvailable: true,
      enrollment: "654321",
      phone: "82888888888",
      cpf: "12345678901",
    });

    const origin = await db.insert(campusLocation).values({ 
      id: "loc-pii-1", 
      name: "Origin", 
      abbreviation: "ORI",
      latitude: 0,
      longitude: 0,
      isActive: true 
    }).returning().then(r => r[0]);
    
    const destination = await db.insert(campusLocation).values({ 
      id: "loc-pii-2", 
      name: "Dest", 
      abbreviation: "DES",
      latitude: 1,
      longitude: 1,
      isActive: true 
    }).returning().then(r => r[0]);

    await db.insert(serviceRequest).values({
      id: "req-pii-1",
      studentProfileId: sProfile.id,
      originLocationId: origin.id,
      destinationLocationId: destination.id,
      status: "pending"
    });

    // 2. Mock context as the scholar
    const ctx = {
      session: { user: scholarUser },
      user: scholarUser,
      realtime: { publish: async () => {} }
    } as any;

    const caller = appRouter.createCaller(ctx);

    // 3. Act
    const availableRequests = await caller.requests.available();

    // 4. Assert
    const request = availableRequests.find((r: any) => r.studentProfileId === sProfile.id);
    expect(request).toBeDefined();
    
    const studentUserResult = request.studentProfile.user;
    expect(studentUserResult).toBeDefined();
    // This is the RED phase: these will currently fail because email and name ARE returned
    expect(studentUserResult.email).toBeUndefined();
    expect(studentUserResult.name).toBeUndefined();

    // Cleanup
    await db.delete(serviceRequest).where(eq(serviceRequest.id, "req-pii-1"));
    await db.delete(studentProfile).where(eq(studentProfile.id, "sp-pii-1"));
    await db.delete(scholarProfile).where(eq(scholarProfile.id, "scp-pii-1"));
    await db.delete(campusLocation).where(eq(campusLocation.id, "loc-pii-1"));
    await db.delete(campusLocation).where(eq(campusLocation.id, "loc-pii-2"));
    await db.delete(user).where(eq(user.id, studentUser.id));
    await db.delete(user).where(eq(user.id, scholarUser.id));
  });
});
