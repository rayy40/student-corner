import { mutation } from "../_generated/server";

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
