import { v } from "convex/values";

import { mutation, query } from "../_generated/server";
import { Message } from "../schema";

export const patchMessages = mutation({
  args: {
    chatId: v.id("chatbook"),
    messages: v.array(Message),
  },
  handler: async (ctx, { chatId, messages }) => {
    //TOOD: check authentication

    const existingChat = await ctx.db
      .query("conversations")
      .withIndex("byChatId", (q) => q.eq("chatId", chatId))
      .unique();

    if (!existingChat) {
      await ctx.db.insert("conversations", {
        chatId: chatId,
        messages,
      });
    } else {
      const existingMessages = existingChat?.messages || [];

      await ctx.db.patch(existingChat?._id, {
        messages: existingMessages.concat(messages),
      });
    }
  },
});

export const getMessages = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, { chatId }) => {
    const converation = await ctx.db
      .query("conversations")
      .withIndex("byChatId", (q) => q.eq("chatId", chatId))
      .unique();

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
      throw new Error("No chat history found.");
    }
    return chats;
  },
});

export const deleteConversation = mutation({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("byChatId", (q) => q.eq("chatId", args.chatId))
      .unique();
    if (!conversation) {
      throw new Error("No conversations found.");
    }
    await ctx.db.patch(conversation?._id, { messages: undefined });
  },
});
