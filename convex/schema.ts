import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { string } from "zod";

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
export const Response = v.object({
  question: v.string(),
  answer: v.string(),
  yourAnswer: v.optional(v.string()),
  options: v.optional(v.array(v.string())),
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
    content: v.string(),
    format: QuizFormat,
    kind: QuizKind,
    response: v.optional(v.union(v.array(Response), v.string())),
    score: v.optional(v.number()),
  }),
});
