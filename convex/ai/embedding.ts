import { WithoutSystemFields } from "convex/server";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { internalAction, internalMutation } from "../_generated/server";

export type EmbeddingArray = WithoutSystemFields<Doc<"embeddings">>;
export type ChunkArray = WithoutSystemFields<Doc<"chunks">>;
export type Chunk = Doc<"chunks">;

export const generateEmbeddings = internalAction({
  args: {
    chatId: v.id("chatbook"),
    title: v.string(),
  },
  handler: async (ctx, { chatId, title }) => {
    try {
      const chunks = await ctx.runQuery(internal.chatbook.chunks.getChunks, {
        chatId,
      });

      const batchSize = 200;
      let embeddings: any[] = [];

      for (
        let batchStart = 0;
        batchStart < chunks.length;
        batchStart += batchSize
      ) {
        const batchEnd = Math.min(batchStart + batchSize, chunks.length);
        const batchChunks = chunks.slice(batchStart, batchEnd);

        const batchEmbeddings = await Promise.all(
          batchChunks
            .flatMap((chunk, index) =>
              [...Array(Math.ceil(chunk.content.length / 8000))].map(
                (_, i) => ({
                  chunk,
                  index: index * Math.ceil(chunk.content.length / 8000) + i,
                  content: chunk.content.slice(i * 8000, (i + 1) * 8000),
                })
              )
            )
            .map(async ({ chunk, index, content }) => {
              const { embedding } = await embed({
                model: openai.embedding("text-embedding-3-small"),
                value: content,
              });
              return { chunk, index, embedding };
            })
        );

        embeddings.push(...batchEmbeddings);
      }

      await ctx.runMutation(internal.ai.embedding.addEmbedding, {
        embeddings,
        chatId,
        title,
      });
    } catch (error) {
      await ctx.runMutation(internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "failed",
        error: "There was an error while generating embeddings.",
      });
    }
  },
});

export const addEmbedding = internalMutation({
  args: {
    embeddings: v.array(
      v.object({
        chunk: v.any(),
        index: v.number(),
        embedding: v.array(v.any()),
      })
    ),
    chatId: v.id("chatbook"),
    title: v.string(),
  },
  handler: async (ctx, { embeddings, chatId, title }) => {
    for (
      let batchStart = 0;
      batchStart < embeddings.length;
      batchStart += 200
    ) {
      const batchEnd = Math.min(batchStart + 200, embeddings.length);
      const batch = embeddings.slice(batchStart, batchEnd);

      const embeddingPromises = batch.flatMap(
        async ({ chunk, index, embedding }) => {
          const embeddingId = await ctx.db.insert("embeddings", {
            embedding,
            chatId,
            chunkId: chunk._id,
          });
          return [embeddingId, ctx.db.patch(chunk._id, { embeddingId })];
        }
      );

      await Promise.all(embeddingPromises);
    }

    await ctx.db.patch(chatId, {
      status: "completed",
      title,
    });
  },
});

export const createEmbeddingForQuery = internalAction({
  args: {
    query: v.string(),
  },
  handler: async (_, { query }) => {
    try {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: query,
      });
      return { success: embedding };
    } catch (error) {
      return { error: "Unable to create embeddings for the query." };
    }
  },
});
