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
  // Images
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

  // Videos
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

  // Audio
  ".mp3",
  ".wav",
  ".flac",
  ".ogg",
  ".aac",
  ".wma",

  // Compressed files
  ".zip",
  ".rar",
  ".7z",
  ".gz",
  ".tar",

  // Binary files
  ".exe",
  ".dll",
  ".obj",
  ".so",
  ".a",
  ".lib",
  ".o",

  // Data files
  ".csv",
  ".xlsx",
  ".xls",
  ".json",
  ".xml",
  ".db",
  ".sql",

  // Config files
  ".env",
  ".ini",
  ".conf",
  ".yml",
  ".yaml",
  ".toml",
  ".properties",

  // Node.js
  ".node",
  ".npmrc",
  ".nvmrc",

  // macOS
  ".DS_Store",

  // Other
  ".log",
  ".out",
  ".bak",
  ".tmp",
  ".lock",
];
