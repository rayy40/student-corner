import { WithoutSystemFields } from "convex/server";
import { v } from "convex/values";

import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { internalAction, internalMutation } from "../_generated/server";
import { fetchEmbedding } from "../openai";

export type EmbeddingArray = WithoutSystemFields<Doc<"chatEmbeddings">>;
export type ChunkArray = WithoutSystemFields<Doc<"chatbookChunks">>;

export const generateEmbeddings = internalAction({
  args: {
    chatId: v.id("chatbook"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const chunks = await ctx.runQuery(internal.helper.chunks.getChunks, {
        chatId: args.chatId,
      });

      for (let batchStart = 0; batchStart < chunks.length; batchStart += 100) {
        const embeddingObjects: EmbeddingArray[] = [];
        const batchEnd = Math.min(batchStart + 100, chunks.length);
        const batch = chunks.slice(batchStart, batchEnd);
        const response = await fetchEmbedding(batch.map((b) => b.content));
        const isLastBatch = batchEnd === batch.length;

        for (let i = 0; i < response.data.length; i++) {
          embeddingObjects.push({
            chatId: args.chatId,
            chunkId: batch[i]._id,
            embedding: response.data[i].embedding,
          });
        }

        await ctx.runMutation(internal.chatbook.embedding.addEmbedding, {
          embeddings: embeddingObjects,
          title: args.title,
          chatId: args.chatId,
          isLastBatch,
        });
      }
    } catch (error) {
      await ctx.runMutation(internal.chatbook.index.updateChatbookStatus, {
        chatId: args.chatId,
        status: "failed",
        error: (error as Error).message,
      });
    }
  },
});

export const addEmbedding = internalMutation({
  args: {
    embeddings: v.array(
      v.object({
        chatId: v.id("chatbook"),
        chunkId: v.id("chatbookChunks"),
        embedding: v.array(v.number()),
      })
    ),
    title: v.string(),
    chatId: v.id("chatbook"),
    isLastBatch: v.boolean(),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.embeddings.map(async (embed) => {
        const embeddingId = await ctx.db.insert("chatEmbeddings", {
          embedding: embed.embedding,
          chatId: embed.chatId,
          chunkId: embed.chunkId,
        });
        await ctx.db.patch(embed.chunkId, {
          embeddingId,
        });
      })
    );
    if (args.isLastBatch) {
      await ctx.db.patch(args.chatId, {
        status: "completed",
        title: args.title,
      });
    }
  },
});
