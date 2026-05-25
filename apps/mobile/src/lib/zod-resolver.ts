import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { ZodIssue, ZodTypeAny } from "zod";

function toFieldErrors<TFieldValues extends FieldValues>(
	issues: ZodIssue[],
): FieldErrors<TFieldValues> {
	return issues.reduce<Record<string, unknown>>((accumulator, issue) => {
		const path = issue.path.join(".");

		if (!path) {
			return accumulator;
		}

		accumulator[path] = {
			type: issue.code,
			message: issue.message,
		};

		return accumulator;
	}, {}) as FieldErrors<TFieldValues>;
}

function zodResolver<TFieldValues extends FieldValues>(
	schema: ZodTypeAny,
): Resolver<TFieldValues> {
	return async (values) => {
		const result = schema.safeParse(values);

		if (result.success) {
			return {
				values: result.data as TFieldValues,
				errors: {},
			};
		}

		return {
			values: {},
			errors: toFieldErrors<TFieldValues>(result.error.issues),
		};
	};
}

export { zodResolver };
