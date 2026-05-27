import { eq, desc } from "drizzle-orm";
import { db } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "../../trpc/context";

export const available = scholarProcedure.query(async () => {
  return db.query.serviceRequest.findMany({
    where: eq(schema.serviceRequest.status, "pending"),
    with: {
      originLocation: true,
      destinationLocation: true,
      studentProfile: { with: { user: true } },
    },
    orderBy: [desc(schema.serviceRequest.createdAt)],
    limit: 50,
  });
});
