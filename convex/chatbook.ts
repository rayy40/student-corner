import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { fetchEmbedding } from "./openai";
import { Message } from "./schema";

export const createChatbook = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("_id"), args.userId));
      if (!user) {
        throw new Error("You need to login first.");
      }
      const url = args.storageId
        ? await ctx.storage.getUrl(args.storageId)
        : args.url;

      if (!url) {
        throw new Error("No URL found.");
      }

      const chatId = await ctx.db.insert("chatbook", {
        userId: args.userId,
        url,
      });

      await ctx.scheduler.runAfter(
        0,
        internal.docs.extractTextAndCreateChunks,
        {
          url,
          chatId,
          kind: args.storageId ? "pdf" : "audio",
        }
      );
      return chatId;
    } catch (error) {
      return error;
    }
  },
});

export const readChatData = internalQuery({
  args: {
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    return chat;
  },
});

export const generateEmbeddings = internalAction({
  args: {
    chatId: v.id("chatbook"),
    chunks: v.array(v.string()),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetchEmbedding(args.chunks.map((chunk) => chunk));
      const allembeddings = response.data as {
        embedding: number[];
        index: number;
      }[];
      allembeddings.sort((a, b) => a.index - b.index);

      const totalEmbeddings = allembeddings.length;

      await ctx.runMutation(internal.chatbook.addEmbeddingsLength, {
        chatId: args.chatId,
        embeddingLength: totalEmbeddings,
      });

      for (let i = 0; i < allembeddings.length; i++) {
        await ctx.runMutation(internal.chatbook.addEmbedding, {
          chatId: args.chatId,
          embedding: allembeddings[i].embedding,
          metadata: args.metadata,
        });
      }
    } catch (err) {
      console.log(err);
      return "Error while creating embeddings.";
    }
  },
});

export const addEmbeddingsLength = internalMutation({
  args: { chatId: v.id("chatbook"), embeddingLength: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, {
      length: args.embeddingLength,
    });
  },
});

export const addEmbedding = internalMutation({
  args: {
    chatId: v.id("chatbook"),
    embedding: v.array(v.number()),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    const chatEmbeddingId = await ctx.db.insert("chatEmbeddings", {
      embedding: args.embedding,
      chatId: args.chatId,
    });
    const existingChatDocument = await ctx.db.get(args.chatId);
    const embeddingIds = existingChatDocument?.embeddingId || [];

    embeddingIds.push(chatEmbeddingId);

    await ctx.db.patch(args.chatId, {
      embeddingId: embeddingIds,
      title:
        args.metadata?.pdf?.info?.title ?? args.metadata?.videoDetails?.title,
      type: args.metadata ?? "Youtube Video",
    });
  },
});

export const getEmbeddingId = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    try {
      const chat = await ctx.db.get(args.chatId);

      if (!chat) {
        throw new Error("No dataset found for this Id.");
      }

      const embeddingId = ctx.db
        .query("chatbook")
        .filter((q) =>
          q.and(
            q.eq(q.field("length"), chat?.embeddingId?.length),
            q.eq(q.field("_id"), chat?._id)
          )
        )
        .unique();
      return embeddingId;
    } catch (error) {
      return "No dataset found for this Id.";
    }
  },
});

export const patchMessages = mutation({
  args: {
    chatId: v.id("chatbook"),
    message: v.array(Message),
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db.get(args.chatId);

    if (!existingChat) {
      throw new Error("No chat history found for this Id.");
    }

    const messages = existingChat?.chat || [];
    messages.push(...args.message);

    await ctx.db.patch(args.chatId, {
      chat: messages,
    });
  },
});

export const getMessageHistory = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    try {
      const chat = await ctx.db.get(args.chatId);

      if (!chat?.chat) {
        throw new Error("No Chat history found.");
      }

      return chat?.chat;
    } catch (error) {
      console.log(error);
      return "No Chat history found.";
    }
  },
});

export const deleteMessageHistory = mutation({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, { chat: undefined });
  },
});
