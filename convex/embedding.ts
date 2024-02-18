import { WithoutSystemFields } from "convex/server";
import { v } from "convex/values";

import { Chunk } from "@/types";

import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { internalAction, internalMutation } from "./_generated/server";
import { fetchEmbedding } from "./openai";

export type EmbeddingArray = WithoutSystemFields<Doc<"chatEmbeddings">>;

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
        title: args.title,
        type: args.type,
        chatId: args.chatId,
      });
    }
  },
});

export const addEmbedding = internalMutation({
  args: {
    embeddings: v.array(
      v.object({
        chatId: v.id("chatbook"),
        source: v.optional(v.string()),
        embedding: v.array(v.number()),
        content: v.string(),
      })
    ),
    type: v.union(v.literal("code"), v.literal("doc"), v.literal("video")),
    title: v.string(),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.embeddings.map(async (embed) => {
        await ctx.db.insert("chatEmbeddings", {
          embedding: embed.embedding,
          content: embed.content,
          chatId: embed.chatId,
          source: embed.source,
        });
      })
    );
    await ctx.db.patch(args.chatId, {
      hasEmbeddingGenerated: true,
      title: args.title,
      type: args.type,
    });
  },
});
