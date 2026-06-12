import { roleValues } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { authEnv } from "@mobiliza/env/auth";
import { webBaseUrl } from "@mobiliza/env/base-url";

import { expo } from "@better-auth/expo";
import type { BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

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
	baseURL: authEnv.API_URL,

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

	/*
	 * Linking de contas OAuth a usuários existentes.
	 *
	 * O Google é marcado como provedor confiável — quando um usuário faz
	 * login com Google e o e-mail bate com um usuário local, o Better Auth
	 * vincula a conta OAuth automaticamente.
	 *
	 * A verificação de e-mail local não é exigida porque:
	 * - Usuários criados por gestores têm emailVerified: true
	 * - Usuários que entram com Google têm emailVerified: true (retornado
	 *   pelo próprio Google no OAuth)
	 *
	 * trustedProviders garante que o Google seja sempre tratado como
	 * provedor confiável para linking implícito.
	 */
	account: {
		skipStateCookieCheck: true,
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
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

	trustedOrigins: [
		...authEnv.TRUSTED_ORIGINS,
		// Deep link scheme do app mobile (usado pelo @better-auth/expo
		// para redirecionar de volta ao app após OAuth).
		"mobiliza://",
	],

	onAPIError: {
		/**
		 * URL para redirecionar quando ocorre um erro no fluxo OAuth
		 * (ex.: usuário cancela o consentimento do Google).
		 *
		 * Em vez da página de erro padrão do Better Auth (que tem um botão
		 * "Go home" apontando para a API), redirecionamos para a página
		 * de autenticação do frontend com o parâmetro `?error=`.
		 *
		 * O frontend (apps/web ou apps/mobile na web) deve ler este
		 * parâmetro e exibir um diálogo de erro adequado.
		 */
		errorURL: `${webBaseUrl}/auth`,
	},

	plugins: [expo() as BetterAuthPlugin],
});

export type Auth = typeof auth;
