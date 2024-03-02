import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const addChunks = internalMutation({
  args: {
    chunks: v.array(v.string()),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.chunks.map(async (chunk) => {
        await ctx.db.insert("chatbookChunks", {
          content: chunk,
          chatId: args.chatId,
        });
      })
    );
  },
});

export const getChunks = internalQuery({
  args: { chatId: v.id("chatbook"), cursor: v.any() },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("chatbookChunks")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .paginate({ cursor: args.cursor, numItems: 50 });
    return chunks;
  },
});
