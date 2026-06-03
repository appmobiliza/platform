/**
 * Tipos auxiliares para a sessão do Better Auth.
 *
 * O campo `role` é um additionalField definido no servidor. O tipo
 * do cliente não o inclui automaticamente, então redefinimos a
 * interface da sessão com o campo tipado.
 */

import type { RoleValues } from "@mobiliza/contracts";

/**
 * Sessão do Better Auth com o campo `role` tipado.
 */
export interface SessionUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
	role: RoleValues;
}

/**
 * Retorna o user da sessão com o tipo correto (incluindo role).
 *
 * O Better Auth inclui `role` no JSON de resposta (por ser um
 * additionalField do servidor), mas o tipo do cliente não o reflete.
 * Esta função apenas adiciona a tipagem correta — em runtime o dado
 * já está presente.
 */
export function toSessionUser(
	user: Record<string, unknown> | null | undefined,
): SessionUser | null {
	if (!user) return null;

	return {
		id: user.id as string,
		name: user.name as string,
		email: user.email as string,
		emailVerified: user.emailVerified as boolean,
		image: (user.image as string | null) ?? null,
		createdAt: user.createdAt as Date,
		updatedAt: user.updatedAt as Date,
		role: (user.role as RoleValues) ?? "student",
	};
}
