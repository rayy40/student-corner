import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const QuizFormat = v.union(
  v.literal("mcq"),
  v.literal("name"),
  v.literal("true_false")
);
const QuizKind = v.union(
  v.literal("topic"),
  v.literal("paragraph"),
  v.literal("document")
);
export const Questions = v.object({
  question: v.string(),
  answer: v.string(),
  yourAnswer: v.optional(v.string()),
  options: v.optional(v.array(v.string())),
});

export const Response = v.object({
  title: v.string(),
  questions: v.array(Questions),
});

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  quiz: defineTable({
    userId: v.id("users"),
    questionNumber: v.number(),
    title: v.optional(v.string()),
    content: v.string(),
    format: QuizFormat,
    kind: QuizKind,
    response: v.optional(v.union(Response, v.string())),
    result: v.optional(
      v.object({
        correctAnswer: v.number(),
        score: v.number(),
      })
    ),
  }),
});
