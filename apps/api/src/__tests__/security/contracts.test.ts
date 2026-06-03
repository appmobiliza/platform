import { UpdateScholarSchema, UpdateStudentSchema } from "@mobiliza/contracts";

import { describe, expect, test } from "@jest/globals";

describe("Contracts: Profile Updates", () => {
	test("UpdateStudentSchema should allow partial updates and validate phone", () => {
		const valid = UpdateStudentSchema.safeParse({ phone: "82999999999" });
		expect(valid.success).toBe(true);

		const invalid = UpdateStudentSchema.safeParse({ phone: "123" });
		expect(invalid.success).toBe(false);
	});

	test("UpdateScholarSchema should allow shift updates", () => {
		const valid = UpdateScholarSchema.safeParse({ shift: "afternoon" });
		expect(valid.success).toBe(true);
	});
});
