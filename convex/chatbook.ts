import { WithoutSystemFields } from "convex/server";
import { ConvexError, v } from "convex/values";

import { extractPathFromUrl, isValidQuizId } from "@/helpers/utils";

import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { fetchEmbedding } from "./openai";
import { Github } from "./schema";

export type Result = Doc<"chatbook"> & { _score: number };
export type EmbeddingArray = WithoutSystemFields<Doc<"chatEmbeddings">> & {
  title: string;
  type: "doc" | "code" | "video";
};

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
      await ctx.scheduler.runAfter(0, internal.docs.createChunks, {
        url,
        id: chatId,
        isGenerateEmbeddings: true,
        chunkSize: 800,
        kind: args.storageId ? "doc" : "video",
      });
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

export const getChatDetails = query({
  args: { chatId: v.id("chatbook") },
  handler: async (ctx, args) => {
    if (!isValidQuizId(args.chatId)) {
      throw new ConvexError("Invalid Id.");
    }

    const chat = await ctx.db.get(args.chatId);

    if (!chat) {
      throw new ConvexError("No dataset found for this Id.");
    }

    if (!chat.embeddingId) {
      return undefined;
    }

    return chat;
  },
});

export const fetchResults = internalQuery({
  args: {
    embeddingIds: v.array(v.id("chatEmbeddings")),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("chatEmbeddings")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
    const results = content
      .filter((c) => args.embeddingIds.includes(c._id))
      .map((c) => c);
    return results;
  },
});

export const semanticSearch = action({
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
        chatId: args.chatId,
      }
    );

    if (chunks.length === 0) {
      return "Unable to find any content related to the file provided.";
    }

    const chunkWithSource: { content: string; source: string }[] = [];
    for (const chunk of chunks) {
      chunkWithSource.push({
        content: chunk.content,
        source: chunk.source ?? "",
      });
    }

    return chunkWithSource;
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

// export const deleteData = mutation({
//   args: { chatId: v.id("chatbook") },
//   handler: async (ctx, args) => {
//     const files = await ctx.db
//       .query("chatEmbeddings")
//       .filter((q) => q.neq(q.field("chatId"), args.chatId))
//       .take(50);

//     for (const file of files) {
//       await ctx.db.delete(file._id);
//     }
//   },
// });
