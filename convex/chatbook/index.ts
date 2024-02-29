import { ConvexError, v } from "convex/values";

import { extractPathFromUrl } from "../helper/utils";

import { internal } from "../_generated/api";
import { internalMutation, mutation, query } from "../_generated/server";
import { Github } from "../schema";

export const createChatbook = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    type: v.union(
      v.literal("documentation"),
      v.literal("codebase"),
      v.literal("youtube"),
      v.literal("files")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .unique();
    if (!user?._id) {
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
      status: "inProgress",
      type: args.type,
    });

    if (args.type === "codebase") {
      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.chunks.codebase.getFilesFromRepo,
        {
          repoUrl: url,
          filePath: extractPathFromUrl(url),
          chatId,
        }
      );
    } else if (args.type === "documentation") {
      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.chunks.documentation.scrapeWebsite,
        {
          chatId,
          url,
        }
      );
    } else if (args.type === "youtube") {
      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.chunks.youtube.createChunks,
        {
          chatId,
          url,
        }
      );
    } else {
      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.chunks.files.createChunks,
        {
          chatId,
          url,
        }
      );
    }

    return chatId;
  },
});

export const getChatDetails = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);

    if (!chat) {
      throw new ConvexError("No dataset found for this Id.");
    }

    if (chat.status === "inProgress") {
      return null;
    }

    return chat;
  },
});

export const updateChatbookStatus = internalMutation({
  args: {
    chatId: v.id("chatbook"),
    status: v.union(
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.error) {
      await ctx.db.patch(args.chatId, {
        status: args.status,
        error: args.error,
      });
    } else {
      await ctx.db.patch(args.chatId, {
        status: args.status,
      });
    }
  },
});

export const patchGithubFiles = internalMutation({
  args: { files: v.array(Github), chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    const files = args.files;

    try {
      await Promise.all(
        files.map(
          async (file) =>
            await ctx.db.insert("github", {
              chatId: args.chatId,
              name: file.name,
              path: file.path,
              html_url: file.html_url,
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

export const getGithubFiles = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("github")
      .withIndex("by_chatId" as never, (q: any) => q.eq("chatId", args.chatId))
      .collect();

    return files;
  },
});

export const getFilePathUrl = query({
  args: { chatId: v.id("chatbook"), path: v.string() },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("github")
      .filter((q) =>
        q.and(
          q.eq(q.field("chatId"), args.chatId),
          q.eq(q.field("path"), args.path)
        )
      )
      .first();

    return file;
  },
});
