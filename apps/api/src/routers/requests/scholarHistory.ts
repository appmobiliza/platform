import { TRPCError } from "@trpc/server";
import { scholarProcedure } from "../../trpc/context";
import { paginationInput } from "./shared";
import { getScholarHistory, AppError } from "@mobiliza/domain";
import { db } from "@mobiliza/db/client";

export const scholarHistory = scholarProcedure
  .input(paginationInput)
  .query(async ({ ctx, input }) => {
    try {
      const history = await getScholarHistory(input, ctx.session.user.id, db);
      return history;
    } catch (error) {
      if (error instanceof AppError) {
        throw new TRPCError({
          code: error.code as any,
          message: error.message,
        });
      }
      throw error;
    }
  });
