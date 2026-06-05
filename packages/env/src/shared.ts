import { z } from "zod";

export const commaSeparatedOrigins = z
	.string()
	.default("http://localhost:3000,http://localhost:3001")
	.transform((value: string) =>
		value
			.split(",")
			.map((origin: string) => origin.trim())
			.filter(Boolean),
	);

export const optionalString = z.preprocess(
	(value) =>
		typeof value === "string" && value.trim() === "" ? undefined : value,
	z.string().min(1).optional(),
);

export const nodeEnvSchema = z
	.enum(["development", "test", "production"])
	.default("development");

export function requireEnvVar<
	T extends Record<string, string | undefined>,
	K extends string & keyof T,
>(env: T, key: K): NonNullable<T[K]> {
	const value = env[key];
	if (!value) {
		throw new Error(
			`Variável de ambiente obrigatória não definida: ${key}`,
		);
	}

	return value;
}
