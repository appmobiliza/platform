/**
 * Tipos para a sessão web com campos adicionais do Better Auth.
 *
 * O Better Auth inclui campos extras (como `role`) no objeto `user`
 * quando configurados em `additionalFields`, mas os tipos gerados
 * pelo cliente React não refletem esses campos automaticamente.
 */

/**
 * Usuário com o campo `role` incluso, conforme configurado no
 * servidor do Better Auth em `@mobiliza/auth`.
 */
export interface WebSessionUser {
	id: string;
	role: string;
	email: string;
	name: string;
	image?: string | null;
}

/**
 * Resposta da sessão do Better Auth com role.
 */
export interface WebSession {
	user: WebSessionUser;
	session: {
		id: string;
		expiresAt: Date;
	};
}
