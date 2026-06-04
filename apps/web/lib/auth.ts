import "server-only";

import { getSession } from "@mobiliza/auth/server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Verifica se o usuário atual é um manager autenticado.
 * Redireciona para `/auth` caso contrário.
 *
 * Use esta função no início de cada página do dashboard
 * para garantir que apenas managers autenticados acessem
 * os dados. Ela é dinâmica (lê headers a cada request),
 * mas as funções de dados cacheadas são separadas.
 */
export async function requireManagerAuth() {
	const h = await headers();
	const session = await getSession(h);

	if (!session || session.user.role !== "manager") {
		redirect("/auth");
	}

	return session;
}
