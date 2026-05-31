import { db } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { roleValues } from "@mobiliza/db/schema";
import { authEnv } from "@mobiliza/env/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { testUtils } from "better-auth/plugins";
/*
const allowedDomains = [
	"@ufal.br",
	"@ic.ufal.br",
];
*/

/**
 * Instância do Better Auth configurada com o adapter do Drizzle.
 *
 * O Better Auth usa as tabelas `user`, `session`, `account` e `verification`
 * definidas em schema/auth.ts. Qualquer campo extra adicionado a essas tabelas
 * (como `role`) é automaticamente reconhecido pelo adapter.
 *
 * Para uso no backend (Hono + tRPC), importe `auth` e use:
 *   - `auth.handler(request)` para o endpoint de autenticação
 *   - `auth.api.getSession({ headers })` para verificar sessões
 *
 * Para testes, use `auth.test.login({ userId })` para criar sessões reais.
 *
 * Referência: https://www.better-auth.com/docs/integrations/hono
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),

	socialProviders: {
		google: {
			clientId: authEnv.GOOGLE_CLIENT_ID,
			clientSecret: authEnv.GOOGLE_CLIENT_SECRET,
		},
	},

	// Futuramente podemos restringir o login apenas para emails do domínio da universidade, mas por enquanto é melhor deixar aberto para facilitar testes e desenvolvimento.
	// O callback de signIn pode ser reativado quando quisermos implementar essa restrição.
	/* callbacks: {
	signIn: async ({ user }) => {
		return allowedDomains.some(domain =>
			user.email.endsWith(domain)
		);
	},
}, */

	/*
	 * Campos extras do `user` que o Better Auth deve reconhecer e
	 * retornar na sessão. O campo `role` é o mais importante — permite
	 * que o middleware de autorização do tRPC saiba se o usuário é
	 * estudante, bolsista ou gestor sem query adicional.
	 */
	user: {
		additionalFields: {
			role: {
				type: [...roleValues],
				required: true,
				defaultValue: "student",
				input: true,
			},
		},
	},

	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24,
	},

	trustedOrigins: authEnv.TRUSTED_ORIGINS,

	plugins: [testUtils()],
});

export type Auth = typeof auth;
