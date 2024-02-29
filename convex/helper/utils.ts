import { v } from "convex/values";
import { internalQuery, mutation } from "../_generated/server";

export const scheduledFunctionsStatus = internalQuery({
  args: { id: v.id("_scheduled_functions") },
  handler: async (ctx, args) => {
    const status = await ctx.db.system.get(args.id);
    return status?.state;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const extractPathFromUrl = (url: string) => {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  const pathWithoutDomain = url.replace(
    /^https:\/\/github\.com\/[^/]+\/[^/]+\//,
    ""
  );
  const path = pathWithoutDomain.split(/[?#]/)[0];
  console.log(path === url ? "" : `/${path}`);
  return path === url ? "" : `/${path}`;
};

export const ignoredExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".svg",
  ".tif",
  ".tiff",
  ".ico",
  ".icns",
  ".svg",
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".wmv",
  ".flv",
  ".webm",
  ".mpg",
  ".mpeg",
  ".3gp",
];
