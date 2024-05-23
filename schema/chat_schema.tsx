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

export const youtubeSchema = z.object({
  youtube: z
    .string()
    .url({ message: "Invalid Url" })
    .refine((val) => isYoutubeUrl(val), { message: "Invalid Youtube url." }),
});

export const codebaseSchema = z.object({
  codebase: z
    .string()
    .url({ message: "Invalid Url" })
    .refine((val) => isGithubUrl(val, { repository: true }), {
      message: "Invalid Github repository url.",
    }),
  repo: z.enum(["public", "private"]).default("public"),
});

export const documentationSchema = z.object({
  documentation: z.string().url({ message: "Invalid Url" }),
});

export const filesSchema = z.object({
  files: File,
});

export const conversationSchema = z.object({
  conversation: z
    .string()
    .max(2500, { message: "Cannot have more than 2500 characters" }),
});
