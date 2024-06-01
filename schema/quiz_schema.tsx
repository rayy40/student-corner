import z from "zod";

function checkFileType(file: File) {
  if (file?.name) {
    const fileType = file.name.split(".").pop();
    if (fileType === "docx" || fileType === "pdf") return true;
  }
  return false;
}

export const topicSchema = z.object({
  topic: z
    .string()
    .min(3, { message: "Topic should be of atleast 3 characters in length" })
    .default(""),
  questions: z
    .number()
    .min(3, { message: "Minimum 3 questions to be generated" })
    .max(10, { message: "Maximum 10 questions can be generated" })
    .default(5),
  format: z.enum(["mcq", "name the following", "true/false"]).default("mcq"),
});

export const paragraphSchema = z.object({
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
  format: z.enum(["mcq", "name the following", "true/false"]).default("mcq"),
});

export const filesSchema = z.object({
  files:
    typeof window === "undefined"
      ? z.any()
      : z
          .instanceof(FileList)
          .refine((file) => file?.length !== 0, "File is required")
          .refine((file) => file?.[0]?.size < 5000000, "Max file size is 5MB.")
          .refine(
            (file) => checkFileType(file?.[0]),
            "Only pdf and docx files are supported."
          ),
  questions: z
    .number()
    .min(3, { message: "Minimum 3 questions to be generated" })
    .max(10, { message: "Maximum 10 questions can be generated" })
    .default(5),
  format: z.enum(["mcq", "name the following", "true/false"]).default("mcq"),
});

export const answerSchema = z.object({
  answers: z.array(z.string()).optional(),
});
