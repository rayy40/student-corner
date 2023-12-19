import z from "zod";

const topicSchema = z.object({
  by: z.enum(["topic", "paragraph"]).default("topic"),
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
  by: z.enum(["topic", "paragraph"]).default("topic"),
  paragraph: z
    .string()
    .min(150, {
      message: "The paragraph should atleast consist of 150 characters",
    })
    .max(5000, { message: "Cannot have more than 5000 characters" }),
  questions: z
    .number()
    .min(3, { message: "Minimum 3 questions to be generated" })
    .max(10, { message: "Maximum 10 questions can be generated" })
    .default(5),
  format: z.enum(["mcq", "name", "true_false"]).default("mcq"),
});

export const quizSchema = z
  .union([topicSchema, paragraphSchema])
  .transform((data) => {
    if (data.by === "topic") {
      return topicSchema.parse(data);
    } else if (data.by === "paragraph") {
      return paragraphSchema.parse(data);
    } else {
      throw new Error("Invalid option selected for 'by");
    }
  });
