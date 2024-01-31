import { ConvexError, v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    try {
      return await ctx.storage.generateUploadUrl();
    } catch (error) {
      return error;
    }
  },
});

export const getFileUrl = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url ?? "No Url Found.";
  },
});
