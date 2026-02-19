import { z } from "zod";

import { and, desc, eq, ne, or } from "@acme/db";
import { messages, user } from "@acme/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const messagesRouter = createTRPCRouter({
  /**
   * List messages for the current user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log(
        "messages.list: starting request for user",
        ctx.session.user.id,
      );
      try {
        const userMessages = await ctx.db.query.messages.findMany({
          where: or(
            eq(messages.senderId, ctx.session.user.id),
            eq(messages.recipientId, ctx.session.user.id),
          ),
          orderBy: desc(messages.createdAt),
          limit: input.limit,
        });

        // Fetch sender names manually to be safe
        const senderIds = [...new Set(userMessages.map((m) => m.senderId))];
        // Also fetch recipient if needed, but for "My Messages", sender is usually most important unless I sent it.
        // If I sent it, I want to know who I sent it to.
        const recipientIds = [
          ...new Set(userMessages.map((m) => m.recipientId)),
        ];

        const allUserIds = [...new Set([...senderIds, ...recipientIds])];

        const userMap = new Map<string, string>();
        if (allUserIds.length > 0) {
          const relatedUsers = await ctx.db.query.user.findMany({
            where: or(...allUserIds.map((id) => eq(user.id, id))),
            columns: {
              id: true,
              name: true,
            },
          });
          relatedUsers.forEach((u) => userMap.set(u.id, u.name));
        }

        console.log(
          "messages.list: success, found",
          userMessages.length,
          "messages",
        );
        return {
          messages: userMessages.map((m) => ({
            ...m,
            senderName: userMap.get(m.senderId) ?? "Desconocido",
            recipientName: userMap.get(m.recipientId) ?? "Desconocido",
            isMe: m.senderId === ctx.session.user.id,
          })),
        };
      } catch (error: any) {
        console.error("messages.list error:", error);
        throw error;
      }
    }),

  /**
   * Send a new message
   */
  send: protectedProcedure
    .input(
      z.object({
        recipientId: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const senderId = ctx.session.user.id;
      const tenantId = ctx.session.user.tenantId; // Might be null/undefined depending on auth setup

      // Ensure conversation exists or create it
      // Simplified: Just insert message.
      // Ideally we manage conversations but for brevity and avoiding JSON parsing issues in MVP:

      // Check if conversation ID needs to be generated or found.
      // For now, generate a new conversation ID for every message if we don't look it up?
      // No, that floods DB.
      // Let's just generate a random conversationId for now, effectively "no conversation grouping" logic
      // enforced strictly, as the frontend list view doesn't group by conversation yet.
      // OR, simple lookup:

      const conversationId = crypto.randomUUID();

      // Try to find existing conversation if tenantId exists
      /* 
      if (tenantId) {
         // lookup logic... 
         // skipping for now to reduce risk of breakage, just send the message.
      }
      */

      const messageId = crypto.randomUUID();
      await ctx.db.insert(messages).values({
        id: messageId,
        tenantId: tenantId ?? "default", // Fallback if needed
        conversationId: conversationId,
        senderId,
        recipientId: input.recipientId,
        senderRole: "user", // Default
        content: input.content,
        type: "text",
        isRead: 0,
        createdAt: new Date(),
      });

      return { success: true, messageId };
    }),

  /**
   * Mark message as read
   */
  markRead: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(messages)
        .set({ isRead: 1, readAt: new Date() })
        .where(
          and(
            eq(messages.id, input.messageId),
            eq(messages.recipientId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  /**
   * Get users to message
   */
  getRecipients: protectedProcedure.query(async ({ ctx }) => {
    console.log("messages.getRecipients: starting query");
    try {
      // Return all users except self
      const allUsers = await ctx.db.query.user.findMany({
        where: ne(user.id, ctx.session.user.id),
        columns: {
          id: true,
          name: true,
          role: true,
        },
        limit: 50,
      });
      console.log(
        "messages.getRecipients: success, found",
        allUsers.length,
        "users",
      );
      return allUsers;
    } catch (error: any) {
      console.error("messages.getRecipients error:", error);
      throw error;
    }
  }),
});
