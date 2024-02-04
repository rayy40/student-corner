import z, { ZodObject } from "zod";

import isGithubUrl from "is-github-url";

const File = z.custom<FileList>().superRefine((files, ctx) => {
  if (files?.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "File must be provided",
    });
    return false;
  }

  if (!["application/pdf"].includes(files?.[0]?.type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Only pdf type files are supported",
    });
    return false;
  }

  if (files?.[0]?.size > 1024 * 1024 * 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "File must be less than 5MB",
    });
    return false;
  }

  return true;
});

const documentSchema = z.object({
  by: z.enum(["youtube", "github", "document"]).default("document"),
  document: File,
});

const youtubeSchema = z.object({
  by: z.enum(["youtube", "github", "document"]).default("document"),
  youtube: z.string().url({ message: "Invalid Url" }),
});

const githubSchema = z.object({
  by: z.enum(["youtube", "github", "document"]).default("document"),
  github: z
    .string()
    .url({ message: "Invalid Url" })
    .refine((val) => isGithubUrl(val, { repository: true }), {
      message: "Please enter a repository Url.",
    }),
  repo: z.enum(["public", "private"]).default("public"),
});

export const chatSchema = z.union([
  youtubeSchema,
  documentSchema,
  githubSchema,
]);
