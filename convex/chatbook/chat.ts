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
          internal.chatbook.chat.updateChatStatus,
          {
            chatId,
            status: "completed",
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
        return { error: "Unable to get chat.", loading: false };
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
