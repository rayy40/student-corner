import { ConvexError, v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { fetchEmbedding } from "./openai";
import { Github, Message } from "./schema";
import { Doc } from "./_generated/dataModel";
import { extractPathFromUrl, isValidQuizId } from "@/helpers/utils";

export type Result = Doc<"chatbook"> & { _score: number };

export const createChatbook = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    type: v.union(
      v.literal("document"),
      v.literal("github"),
      v.literal("youtube")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId));
    if (!user) {
      throw new ConvexError("You need to login first.");
    }

    const url = args.storageId
      ? await ctx.storage.getUrl(args.storageId)
      : args.url;

    if (!url) {
      throw new ConvexError("No URL found.");
    }

    const chatId = await ctx.db.insert("chatbook", {
      userId: args.userId,
      url,
    });

    if (args.type === "github") {
      await ctx.scheduler.runAfter(0, internal.github.getFilesFromRepo, {
        repoUrl: url,
        filePath: extractPathFromUrl(url),
        chatId,
      });
    } else {
      await ctx.scheduler.runAfter(
        0,
        internal.docs.extractTextAndCreateChunks,
        {
          url,
          id: chatId,
          isGenerateEmbeddings: true,
          chunkSize: 800,
          kind: args.storageId ? "pdf" : "audio",
        }
      );
    }

    return chatId;
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
    title: v.string(),
    type: v.union(v.literal("video"), v.literal("doc"), v.literal("code")),
  },
  handler: async (ctx, args) => {
    const BATCH_SIZE = 100;
    for (
      let batchStart = 0;
      batchStart < args.chunks.length;
      batchStart += BATCH_SIZE
    ) {
      const batchEnd = batchStart + BATCH_SIZE;
      const batch = args.chunks.slice(batchStart, batchEnd);

      const response = await fetchEmbedding(batch);

      if (typeof response === "string") {
        throw new ConvexError(response);
      }

      for (let i = 0; i < response.data.length; i++) {
        await ctx.runMutation(internal.chatbook.addEmbedding, {
          chatId: args.chatId,
          content: args.chunks[i],
          embedding: response.data[i].embedding,
          title: args.title,
          type: args.type,
        });
      }
    }
  },
});

export const addEmbedding = internalMutation({
  args: {
    chatId: v.id("chatbook"),
    content: v.string(),
    embedding: v.array(v.number()),
    title: v.string(),
    type: v.union(v.literal("code"), v.literal("doc"), v.literal("video")),
  },
  handler: async (ctx, args) => {
    const chatEmbeddingId = await ctx.db.insert("chatEmbeddings", {
      embedding: args.embedding,
      content: args.content,
      chatId: args.chatId,
    });
    const existingChatDocument = await ctx.db.get(args.chatId);
    const embeddingIds = existingChatDocument?.embeddingId || [];

    embeddingIds.push(chatEmbeddingId);

    await ctx.db.patch(args.chatId, {
      embeddingId: embeddingIds,
      title: args.title,
      type: args.type,
    });
  },
});

export const getEmbeddingId = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    if (!isValidQuizId(args.chatId)) {
      throw new ConvexError("Invalid Id.");
    }

    const chat = await ctx.db.get(args.chatId);

    if (!chat) {
      throw new ConvexError("No dataset found for this Id.");
    }

    const embeddingId = ctx.db
      .query("chatbook")
      .filter((q) => q.and(q.eq(q.field("_id"), chat?._id)))
      .unique();

    if (!embeddingId) {
      throw new ConvexError("No embedding Id found.");
    }

    if (!chat.embeddingId) {
      return null;
    }

    return embeddingId;
  },
});

export const patchMessages = mutation({
  args: {
    chatId: v.id("chatbook"),
    message: Message,
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db.get(args.chatId);

    if (!existingChat) {
      throw new ConvexError("No chat history found for this Id.");
    }

    const messages = existingChat?.chat || [];

    await ctx.db.patch(args.chatId, {
      chat: messages.concat([args.message]),
    });
  },
});

export const getMessageHistory = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);

    return !chat?.chat ? null : chat?.chat;
  },
});

export const getChatHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chatbook")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    if (chats.length === 0) {
      throw new ConvexError("No chat history found.");
    }
    return chats;
  },
});

export const deleteMessageHistory = mutation({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, { chat: undefined });
  },
});

export const fetchResults = internalQuery({
  args: {
    embeddingIds: v.array(v.id("chatEmbeddings")),
  },
  handler: async (ctx, args) => {
    const results: Array<Doc<"chatEmbeddings">> = [];
    for (const embeddingId of args.embeddingIds) {
      const content = await ctx.db.get(embeddingId);
      if (content === null) {
        continue;
      }
      results.push(content);
    }
    return results;
  },
});

export const similarContent = action({
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

    const chunks: Array<Doc<"chatEmbeddings">> = await ctx.runQuery(
      internal.chatbook.fetchResults,
      {
        embeddingIds: filteredResults.map((result) => result._id),
      }
    );

    if (chunks.length === 0) {
      return "Unable to find any content related to the file provided.";
    }

    return chunks.map((d: Doc<"chatEmbeddings">) => d.content).join("\n\n");
  },
});

export const patchGithubFiles = internalMutation({
  args: { files: v.array(Github) },
  handler: async (ctx, args) => {
    const files = args.files;

    try {
      await Promise.all(
        files.map(
          async (file) =>
            await ctx.db.insert("github", {
              name: file.name,
              path: file.path,
              url: file.url,
              content: file.content,
              download_url: file.download_url,
            })
        )
      );
    } catch (error) {
      console.log("Error inserting documents", (error as Error).message);
    }
  },
});
