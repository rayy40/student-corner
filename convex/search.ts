import { ConvexError, v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { fetchEmbedding } from "./openai";
import { internal } from "./_generated/api";

export const fetchResults = internalQuery({
  args: {
    embeddingIds: v.array(v.id("chatEmbeddings")),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, args) => {
    const chunks = await Promise.all(
      args.embeddingIds.map(async (embedding) => {
        const result = await ctx.db
          .query("chatbookChunks")
          .withIndex("by_embeddingId", (q) => q.eq("embeddingId", embedding))
          .unique();
        return result;
      })
    );

    return chunks;
  },
});

export const semanticSearch = action({
  args: { chatId: v.id("chatbook"), query: v.string() },
  handler: async (ctx, args) => {
    const embed = await fetchEmbedding([args.query]);
    if (typeof embed === "string") {
      throw new ConvexError(embed);
    }

    const results = await ctx.vectorSearch("chatEmbeddings", "by_embedding", {
      vector: embed.data[0].embedding,
      limit: 4,
      filter: (q) => q.eq("chatId", args.chatId),
    });

    const filteredResults = results.filter((r) => r._score > 0.7);

    if (filteredResults.length === 0) {
      return "Unable to find any content related to the file provided.";
    }

    const chunks = await ctx.runQuery(internal.search.fetchResults, {
      embeddingIds: filteredResults.map((result) => result._id),
      chatId: args.chatId,
    });

    const filteredChunks: string[] = chunks.map(
      (chunk) => chunk! && chunk?.content
    );

    return filteredChunks;
  },
});
