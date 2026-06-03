import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import { scholarProfile, studentProfile, user } from "@mobiliza/db/schema";

import { describe, expect, test } from "@jest/globals";
import { uuidv7 } from "uuidv7";

import { appRouter } from "../../router";

describe("Profiles: Update Mutations", () => {
	test("updateStudent should update profile fields and disabilities", async () => {
		// 1. Setup mock data
		const studentUser = await db
			.insert(user)
			.values({
				id: uuidv7(),
				name: "Update Student",
				email: `update_student_${uuidv7()}@test.com`,
				role: "student",
			})
			.returning()
			.then((r) => r[0]);

		const sProfile = await db
			.insert(studentProfile)
			.values({
				id: uuidv7(),
				userId: studentUser.id,
				course: "Ciência da Computação",
				campus: "Campus A.C. Simões",
				shift: "morning",
				gender: "male",
				enrollment: `ENROLL_${uuidv7()}`,
				phone: "82999999999",
			})
			.returning()
			.then((r) => r[0]);

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
			disabilityTypes: ["blindness"],
		});

		// 4. Assert
		const updated = await db.query.studentProfile.findFirst({
			where: eq(studentProfile.id, sProfile.id),
			with: { disabilities: true },
		});

		expect(updated).toBeDefined();
		expect(updated?.phone).toBe("82900000000");
		expect(updated?.nickname).toBe("Mariazinha");
		expect(updated?.disabilities.length).toBe(1);
		expect(updated?.disabilities[0].disabilityType).toBe("blindness");
	});

	test("updateScholar should allow updating shift and course", async () => {
		// 1. Setup mock data
		const scholarUser = await db
			.insert(user)
			.values({
				id: uuidv7(),
				name: "Update Scholar",
				email: `update_scholar_${uuidv7()}@test.com`,
				role: "scholar",
			})
			.returning()
			.then((r) => r[0]);

		const schProfile = await db
			.insert(scholarProfile)
			.values({
				id: uuidv7(),
				userId: scholarUser.id,
				course: "Matemática",
				campus: "Campus A.C. Simões",
				shift: "morning",
				enrollment: `ENROLL_${uuidv7()}`,
				phone: "82999999999",
				cpf: Math.floor(Math.random() * 10000000000)
					.toString()
					.padStart(11, "0"),
				isAvailable: false,
			})
			.returning()
			.then((r) => r[0]);

		// 2. Mock context
		const ctx = {
			session: { user: scholarUser },
			user: scholarUser,
		} as any;

		const caller = appRouter.createCaller(ctx);

		// 3. Act
		await caller.profiles.updateScholar({
			shift: "afternoon",
			course: "Ciência da Computação",
		});

		// 4. Assert
		const updated = await db.query.scholarProfile.findFirst({
			where: eq(scholarProfile.id, schProfile.id),
		});

		expect(updated).toBeDefined();
		expect(updated?.shift).toBe("afternoon");
		expect(updated?.course).toBe("Ciência da Computação");
	});
});
