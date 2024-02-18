import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Message } from "./schema";

export const patchMessages = mutation({
  args: {
    chatId: v.id("chatbook"),
    message: Message,
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db
      .query("conversations")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();

    if (!existingChat) {
      const conversationId = (await ctx.db.insert("conversations", {
        chatId: args.chatId,
        messages: [args.message],
      })) as string;
      await ctx.db.patch(args.chatId, {
        conversationId,
      });
    } else {
      const messages = existingChat?.messages || [];

      await ctx.db.patch(existingChat?._id, {
        messages: messages.concat([args.message]),
      });
    }
  },
});

export const getConversation = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    const converation = await ctx.db
      .query("conversations")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();

    return converation?.messages;
  },
});

export const getChatsHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chatbook")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    if (chats.length === 0) {
      throw new ConvexError("No chat history found.");
    }
    return chats;
  },
});

export const deleteConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { messages: undefined });
  },
});
