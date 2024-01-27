import z from "zod";

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
  by: z.enum(["link", "document"]).default("document"),
  document: File,
});

const linkSchema = z.object({
  by: z.enum(["link", "document"]).default("document"),
  link: z.string().url(),
});

export const chatSchema = z
  .union([linkSchema, documentSchema])
  .transform((data) => {
    if (data.by === "document") {
      return documentSchema.parse(data);
    } else if (data.by === "link") {
      return linkSchema.parse(data);
    } else {
      throw new Error("Invalid option selected for 'by");
    }
  });
