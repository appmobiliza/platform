/**
 * tRPC Client Configuration for React Native
 *
 * Este arquivo exporta os hooks tipados do tRPC.
 * Ele infere os tipos diretamente do backend (@mobiliza/api) sem precisar importar código,
 * garantindo type-safety de ponta a ponta.
 */

import type { AppRouter } from "@mobiliza/api/router";

import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();

/**
 * Função utilitária para inferir tipos de retorno e input do tRPC no frontend.
 * Útil para tipar componentes baseados em respostas da API.
 *
 * @example
 * type RequestOutput = RouterOutputs['requests']['available'][number];
 */
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
