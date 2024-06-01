import { v } from "convex/values";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { internal } from "../_generated/api";

export const createChunks = internalMutation({
  args: { text: v.string(), chatId: v.id("chatbook"), title: v.string() },
  handler: async (ctx, { chatId, text, title }) => {
    try {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 3000,
        chunkOverlap: 200,
      });

      const chunks = await splitter.splitText(text);

      for (let batchStart = 0; batchStart < chunks.length; batchStart += 200) {
        const batchEnd = Math.min(batchStart + 100, chunks.length);
        const batch = chunks.slice(batchStart, batchEnd);

        const chunksPromises = batch.map((chunk) =>
          ctx.db.insert("chunks", {
            chatId,
            content: chunk,
          })
        );

        await Promise.all(chunksPromises);
      }

      await ctx.scheduler.runAfter(
        0,
        internal.ai.embedding.generateEmbeddings,
        {
          chatId,
          title,
        }
      );
    } catch (error) {
      await ctx.scheduler.runAfter(0, internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "failed",
        error: "Unable to create chunks from the provided text.",
      });
    }
  },
});

export const getChunks = internalQuery({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, { chatId }) => {
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("byChatId", (q) => q.eq("chatId", chatId))
      .collect();
    return chunks;
  },
});

export const insertChunks = internalMutation({
  args: {
    chatId: v.id("chatbook"),
    chunks: v.array(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { chatId, chunks, title }) => {
    try {
      const chunksPromises = chunks.map((chunk) =>
        ctx.db.insert("chunks", {
          chatId,
          content: chunk,
        })
      );

      await Promise.all(chunksPromises);

      await ctx.scheduler.runAfter(
        0,
        internal.ai.embedding.generateEmbeddings,
        {
          chatId,
          title: title ?? "Untitled",
        }
      );
    } catch (error) {
      await ctx.scheduler.runAfter(0, internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "failed",
        error: "Unable to insert chunks into the database.",
      });
    }
  },
});
