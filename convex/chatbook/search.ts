import { v } from "convex/values";
import { action, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";

export const fetchResults = internalQuery({
  args: {
    embeddingIds: v.array(v.id("embeddings")),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, { embeddingIds }) => {
    const chunks = await Promise.all(
      embeddingIds.map(async (embedding) => {
        const result = await ctx.db
          .query("chunks")
          .withIndex("byEmbeddingId", (q) => q.eq("embeddingId", embedding))
          .unique();
        return result;
      })
    );

    return chunks;
  },
});

export const semanticSearch = action({
  args: { chatId: v.id("chatbook"), query: v.string() },
  handler: async (ctx, { chatId, query }) => {
    const { success, error } = await ctx.runAction(
      internal.ai.embedding.createEmbeddingForQuery,
      {
        query,
      }
    );

    if (error) {
      return { error: "Unable to create embeddings for the query." };
    }

    if (success) {
      const results = await ctx.vectorSearch("embeddings", "byEmbedding", {
        vector: success,
        limit: 4,
        filter: (q) => q.eq("chatId", chatId),
      });

      const chunks = await ctx.runQuery(internal.chatbook.search.fetchResults, {
        embeddingIds: results.map((result) => result._id),
        chatId,
      });

      const filteredChunks: string[] = chunks.map(
        (chunk) => chunk! && chunk?.content
      );
      return filteredChunks;
    }
  },
});
