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
  }),
});
