import { test, expect, describe } from "@jest/globals";
// @ts-ignore
import { UpdateStudentSchema, UpdateScholarSchema } from "@mobiliza/contracts";

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
