import { WithoutSystemFields } from "convex/server";
import { ConvexError, v } from "convex/values";

import { isValidQuizId } from "@/helpers/utils";
import { Chunk } from "@/types";

import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { internalAction, internalMutation, query } from "./_generated/server";
import { fetchEmbedding } from "./openai";

export type EmbeddingArray = WithoutSystemFields<Doc<"chatEmbeddings">> & {
  title: string;
  type: "doc" | "code" | "video";
};

export const generateEmbeddings = internalAction({
  args: {
    chatId: v.id("chatbook"),
    chunks: v.union(
      v.array(v.object({ content: v.string(), source: v.string() })),
      v.array(v.string())
    ),
    title: v.string(),
    type: v.union(v.literal("video"), v.literal("doc"), v.literal("code")),
  },
  handler: async (ctx, args) => {
    const BATCH_SIZE = 100;
    const content =
      typeof args.chunks[0] !== "string"
        ? (args.chunks as Chunk[]).map((chunk) => chunk.content)
        : (args.chunks as string[]);
    const contentBatches = [];

    for (
      let batchStart = 0;
      batchStart < content.length;
      batchStart += BATCH_SIZE
    ) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, content.length);
      contentBatches.push(content.slice(batchStart, batchEnd));
    }

    const responses = await Promise.all(
      contentBatches.map(async (batch) => {
        const res = await fetchEmbedding(batch);
        return res;
      })
    );

    const embeddingObjects: EmbeddingArray[] = [];

    for (const response of responses) {
      for (let i = 0; i < response.data.length; i++) {
        const chunk =
          typeof args.chunks[0] !== "string"
            ? (args.chunks[i] as Chunk)
            : undefined;
        embeddingObjects.push({
          chatId: args.chatId,
          content: chunk?.content ?? (args.chunks[i] as string),
          source: chunk?.source ?? "",
          embedding: response.data[i].embedding,
          title: args.title,
          type: args.type,
        });
      }
    }

    for (
      let batchStart = 0;
      batchStart < embeddingObjects.length;
      batchStart += BATCH_SIZE
    ) {
      const batchEnd = Math.min(
        batchStart + BATCH_SIZE,
        embeddingObjects.length
      );
      const responseBatches = embeddingObjects.slice(batchStart, batchEnd);
      await ctx.runMutation(internal.embedding.addEmbedding, {
        embeddings: responseBatches,
      });
    }
  },
});

export const addEmbedding = internalMutation({
  args: {
    embeddings: v.array(
      v.object({
        chatId: v.id("chatbook"),
        title: v.string(),
        source: v.optional(v.string()),
        embedding: v.array(v.number()),
        content: v.string(),
        type: v.union(v.literal("code"), v.literal("doc"), v.literal("video")),
      })
    ),
  },
  handler: async (ctx, args) => {
    let embeddingIds: Id<"chatEmbeddings">[] = [];
    await Promise.all(
      args.embeddings.map(async (embed) => {
        const chatEmbeddingId = await ctx.db.insert("chatEmbeddings", {
          embedding: embed.embedding,
          content: embed.content,
          chatId: embed.chatId,
          source: embed.source,
        });
        const existingChatDocument = await ctx.db.get(embed.chatId);
        embeddingIds = [...(existingChatDocument?.embeddingId || [])];

        embeddingIds.push(chatEmbeddingId);
      })
    );
    await ctx.db.patch(args.embeddings[0].chatId, {
      embeddingId: embeddingIds,
      title: args.embeddings[0].title,
      type: args.embeddings[0].type,
    });
  },
});
