import { z } from "zod";

import { eq } from "@acme/db";
import { user } from "@acme/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        email: z.string().email().optional(),
        image: z.string().url().optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [updatedUser] = await ctx.db
        .update(user)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(user.id, userId))
        .returning();

      return updatedUser;
    }),
});
