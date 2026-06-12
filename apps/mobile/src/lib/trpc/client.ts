/**
 * tRPC Client Configuration for React Native
 *
 * Este arquivo exporta os hooks tipados do tRPC.
 * Ele infere os tipos diretamente do backend (@mobiliza/api) sem precisar importar código,
 * garantindo type-safety de ponta a ponta.
 */

import type {
	AppRouter,
	RouterInputs,
	RouterOutputs,
} from "@mobiliza/trpc-types";

import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();

export type { RouterInputs, RouterOutputs };
