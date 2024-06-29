import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { extractPathFromUrl } from "../lib/utils";
import { ChatKind, Github, Status } from "../schema";

export const createChatbook = mutation({
  args: {
    userId: v.id("users"),
    url: v.string(),
    domain: v.optional(v.string()),
    type: ChatKind,
  },
  handler: async (ctx, { userId, url, type, domain }) => {
    //TODO: check if user is authenticated

    const chatId = await ctx.db.insert("chatbook", {
      userId,
      url,
      status: "inProgress",
      domain,
      type,
    });

    if (!chatId) {
      throw new ConvexError("Chat creation failed.");
    }

    if (type === "youtube") {
      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.youtube.transcribeVideos,
        {
          chatId,
          url,
        }
      );
    } else if (type === "files") {
      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.files.extractTextsFromFile,
        {
          chatId,
          url,
        }
      );
    } else if (type === "github") {
      const path = extractPathFromUrl(url);

      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.github.getFilesFromRepo,
        {
          chatId,
          url,
          path,
        }
      );
    } else if (type === "documentation") {
      const chat = await ctx.db
        .query("chatbook")
        .withIndex("byDomainAndStatus", (q) =>
          q.eq("domain", domain).eq("status", "completed")
        )
        .first();
      if (chat) {
        await ctx.scheduler.runAfter(
          0,
          internal.chatbook.chat.updateExistingChat,
          {
            existingId: chat._id,
            chatId,
          }
        );
      } else {
        await ctx.scheduler.runAfter(
          0,
          internal.chatbook.documentation.scrapeWebsite,
          {
            chatId,
            url,
          }
        );
      }
    }

    return chatId;
  },
});

export const getChat = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, { chatId }) => {
    const chat = await ctx.db.get(chatId);

    if (chat) {
      if (chat.status === "failed") {
        return { error: chat.error || "Unable to get chat.", loading: false };
      }
      if (chat.status === "inProgress") {
        return { loading: true };
      }
      return { success: chat, loading: false };
    } else {
      return { error: "No chat found.", loading: false };
    }
  },
});

export const updateExistingChat = internalMutation({
  args: {
    existingId: v.id("chatbook"),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, { chatId, existingId }) => {
    try {
      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.chat.copyExistingChunksAndEmbeddings,
        {
          existingId,
          chatId,
        }
      );
      await ctx.scheduler.runAfter(0, internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "completed",
      });
    } catch (error) {
      await ctx.scheduler.runAfter(0, internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "failed",
        error: "Unable to update chat.",
      });
    }
  },
});

export const copyExistingChunksAndEmbeddings = internalMutation({
  args: {
    chatId: v.id("chatbook"),
    existingId: v.id("chatbook"),
  },
  handler: async (ctx, { chatId, existingId }) => {
    try {
      const chunks = await ctx.db
        .query("chunks")
        .withIndex("byChatId", (q) => q.eq("chatId", existingId))
        .collect();
      const embeddings = await ctx.db
        .query("embeddings")
        .withIndex("byChatId", (q) => q.eq("chatId", existingId))
        .collect();

      for (let batchStart = 0; batchStart < chunks.length; batchStart += 200) {
        const batchEnd = Math.min(batchStart + 200, chunks.length);
        const batch = chunks.slice(batchStart, batchEnd);

        const promises = batch.flatMap(async ({ content }, index) => {
          const chunkId = await ctx.db.insert("chunks", {
            chatId,
            content,
          });
          const embeddingId = await ctx.db.insert("embeddings", {
            chatId,
            chunkId,
            embedding: embeddings[index].embedding,
          });
          await ctx.db.patch(chunkId, {
            embeddingId,
          });
        });

        await Promise.all(promises);
      }
    } catch (error) {
      await ctx.db.patch(chatId, {
        status: "failed",
        error: "Unable to copy existing chunks.",
      });
    }
  },
});

export const updateChatStatus = internalMutation({
  args: {
    chatId: v.id("chatbook"),
    error: v.optional(v.string()),
    status: Status,
  },
  handler: async (ctx, { chatId, error, status }) => {
    if (error) {
      await ctx.db.patch(chatId, {
        status,
        error,
      });
    } else {
      await ctx.db.patch(chatId, {
        status,
      });
    }
  },
});

export const patchFiles = internalMutation({
  args: { files: v.array(Github), chatId: v.id("chatbook") },
  handler: async (ctx, { files, chatId }) => {
    const promises = files.map((file) => {
      ctx.db.insert("github", {
        chatId,
        ...file,
      });
    });

    await Promise.all(promises);
  },
});

export const isExistingUrl = internalQuery({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    const chat = await ctx.db
      .query("chatbook")
      .withIndex("byUrlAndStatus", (q) =>
        q.eq("url", url).eq("status", "completed")
      )
      .first();
    return chat;
  },
});

export const getGithubFiles = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, { chatId }) => {
    const files = await ctx.db
      .query("github")
      .withIndex("byChatId", (q) => q.eq("chatId", chatId))
      .collect();

    if (files.length === 0) return [];

    return files;
  },
});

export const getChatHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const chats = await ctx.db
      .query("chatbook")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();

    return chats;
  },
});
