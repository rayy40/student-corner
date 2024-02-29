import z from "zod";

import isGithubUrl from "is-github-url";
import { isDocsUrl, isYoutubeUrl } from "@/helpers/utils";

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

const youtubeSchema = z.object({
  by: z
    .enum(["youtube", "codebase", "documentation", "files"])
    .default("files"),
  youtube: z
    .string()
    .url({ message: "Invalid Url" })
    .refine((val) => isYoutubeUrl(val), { message: "Invalid Youtube url." }),
});

const githubSchema = z.object({
  by: z
    .enum(["youtube", "codebase", "documentation", "files"])
    .default("files"),
  codebase: z
    .string()
    .url({ message: "Invalid Url" })
    .refine((val) => isGithubUrl(val, { repository: true }), {
      message: "Invalid Github repository url.",
    }),
  repo: z.enum(["public", "private"]).default("public"),
});

const docsSchema = z.object({
  by: z
    .enum(["youtube", "codebase", "documentation", "files"])
    .default("files"),
  documentation: z.string().url({ message: "Invalid Url" }),
});

const documentSchema = z.object({
  by: z
    .enum(["youtube", "codebase", "documentation", "files"])
    .default("files"),
  files: File,
});

export const chatSchema = z
  .union([youtubeSchema, githubSchema, docsSchema, documentSchema])
  .transform((data) => {
    if (data.by === "documentation") {
      return docsSchema.parse(data);
    } else if (data.by === "youtube") {
      return youtubeSchema.parse(data);
    } else if (data.by === "codebase") {
      return githubSchema.parse(data);
    } else if (data.by === "files") {
      return documentSchema.parse(data);
    } else {
      throw new Error("Invalid option selected for 'by");
    }
  });
