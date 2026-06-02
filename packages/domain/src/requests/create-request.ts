import type { CreateRequestSchema } from "@mobiliza/contracts";
import type { Database } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import type { z } from "zod";

import { BadRequestError, ConflictError, ForbiddenError } from "../errors";

export async function createRequest(
	input: z.infer<typeof CreateRequestSchema>,
	userId: string,
	db: Database,
) {
	const studentProfile = await db.query.studentProfile.findFirst({
		where: eq(schema.studentProfile.userId, userId),
	});

	if (!studentProfile) {
		throw new ForbiddenError(
			"Apenas estudantes cadastrados podem criar solicitações.",
		);
	}

	if (!studentProfile.isActive) {
		throw new ForbiddenError(
			"Seu perfil está inativo. Entre em contato com o NAC.",
		);
	}

	if (input.originLocationId === input.destinationLocationId) {
		throw new BadRequestError(
			"Origem e destino não podem ser o mesmo local.",
		);
	}

	// Verifica se o estudante já tem uma solicitação ativa
	const activeRequest = await db.query.serviceRequest.findFirst({
		where: and(
			eq(schema.serviceRequest.studentProfileId, studentProfile.id),
			sql`${schema.serviceRequest.status} IN ('pending', 'accepted', 'ongoing')`,
		),
	});

	if (activeRequest) {
		throw new ConflictError(
			"Você já tem uma solicitação em andamento. Conclua ou cancele antes de criar uma nova.",
		);
	}

	const id = uuidv7();

	const [request] = await db
		.insert(schema.serviceRequest)
		.values({
			id,
			studentProfileId: studentProfile.id,
			originLocationId: input.originLocationId,
			destinationLocationId: input.destinationLocationId,
			notes: input.notes,
			status: "pending",
		})
		.returning();

	return request;
}
