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

const topicSchema = z.object({
  by: z.enum(["topic", "paragraph", "document"]).default("topic"),
  topic: z
    .string()
    .min(3, { message: "Topic should be of atleast 3 characters in length" }),
  questions: z
    .number()
    .min(3, { message: "Minimum 3 questions to be generated" })
    .max(10, { message: "Maximum 10 questions can be generated" })
    .default(5),
  format: z.enum(["mcq", "name", "true_false"]).default("mcq"),
});

const paragraphSchema = z.object({
  by: z.enum(["topic", "paragraph", "document"]).default("topic"),
  paragraph: z
    .string()
    .min(150, {
      message: "Enter atleast 150 characters",
    })
    .max(5000, { message: "Cannot have more than 5000 characters" }),
  questions: z
    .number()
    .min(3, { message: "Minimum 3 questions to be generated" })
    .max(10, { message: "Maximum 10 questions can be generated" })
    .default(5),
  format: z.enum(["mcq", "name", "true_false"]).default("mcq"),
});

const filesSchema = z.object({
  by: z.enum(["topic", "paragraph", "files"]).default("topic"),
  files: File,
  questions: z
    .number()
    .min(3, { message: "Minimum 3 questions to be generated" })
    .max(10, { message: "Maximum 10 questions can be generated" })
    .default(5),
  format: z.enum(["mcq", "name", "true_false"]).default("mcq"),
});

export const quizSchema = z
  .union([topicSchema, paragraphSchema, filesSchema])
  .transform((data) => {
    if (data.by === "files") {
      return filesSchema.parse(data);
    } else if (data.by === "paragraph") {
      return paragraphSchema.parse(data);
    } else if (data.by === "topic") {
      return topicSchema.parse(data);
    } else {
      throw new Error("Invalid option selected for 'by");
    }
  });

export const answerSchema = z.object({
  answers: z.array(z.string()).optional(),
});
