/**
 * @mobiliza/trpc-types — Tipos do tRPC compartilhados entre cliente e servidor.
 *
 * Este pacote exporta APENAS tipos, sem runtime. É usado pelo mobile e web
 * para type-safety de ponta a ponta sem arrastar dependências de servidor.
 */

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Re-exporta apenas o tipo AppRouter — "import type" é removido em runtime
export type { AppRouter } from "@mobiliza/api/router";

// Utilitários de tipo para o cliente
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
