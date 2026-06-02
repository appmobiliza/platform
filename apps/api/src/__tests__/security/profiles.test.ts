import { test, expect, describe } from "@jest/globals";
import { appRouter } from "../../router";
import { db } from "@mobiliza/db/client";
import { user, studentProfile } from "@mobiliza/db/schema";
import { eq } from "@mobiliza/db/drizzle";
import { uuidv7 } from "uuidv7";

describe("Profiles: Update Mutations", () => {
  test("updateStudent should update profile fields and disabilities", async () => {
    // 1. Setup mock data
    const studentUser = await db.insert(user).values({
      id: uuidv7(),
      name: "Update Student",
      email: `update_student_${uuidv7()}@test.com`,
      role: "student"
    }).returning().then(r => r[0]);

    const sProfile = await db.insert(studentProfile).values({
      id: uuidv7(),
      userId: studentUser.id,
      course: "Ciência da Computação",
      campus: "Campus A.C. Simões",
      shift: "morning",
      gender: "male",
      enrollment: `ENROLL_${uuidv7()}`,
      phone: "82999999999",
    }).returning().then(r => r[0]);

    // 2. Mock context
    const ctx = {
      session: { user: studentUser },
      user: studentUser,
    } as any;

    const caller = appRouter.createCaller(ctx);

    // 3. Act
    await caller.profiles.updateStudent({
      phone: "82900000000",
      nickname: "Mariazinha",
      disabilityTypes: ["blindness"]
    });

    // 4. Assert
    const updated = await db.query.studentProfile.findFirst({
      where: eq(studentProfile.id, sProfile.id),
      with: { disabilities: true }
    });
    
    expect(updated).toBeDefined();
    expect(updated?.phone).toBe("82900000000");
    expect(updated?.nickname).toBe("Mariazinha");
    expect(updated?.disabilities.length).toBe(1);
    expect(updated?.disabilities[0].disabilityType).toBe("blindness");
  });
});
