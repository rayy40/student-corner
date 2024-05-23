import { z } from "zod";

export const mcqOrTrueFalseResult = z.object({
  title: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      options: z.array(z.string()).max(4),
    })
  ),
});

export const nameTheFollowingResult = z.object({
  title: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});
