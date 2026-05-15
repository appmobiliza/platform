import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./client";
import * as schema from "./schema";

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

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  /*
   * Campos extras do `user` que o Better Auth deve reconhecer e
   * retornar na sessão. O campo `role` é o mais importante — permite
   * que o middleware de autorização do tRPC saiba se o usuário é
   * estudante, bolsista ou gestor sem query adicional.
   */
  user: {
    additionalFields: {
      role: {
        type: "string",
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

  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") ?? [],
});

export type Auth = typeof auth;
