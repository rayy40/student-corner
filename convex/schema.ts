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
const Role = v.union(
  v.literal("system"),
  v.literal("user"),
  v.literal("assistant"),
  v.literal("function"),
  v.literal("data"),
  v.literal("tool")
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

export const Message = v.object({
  id: v.string(),
  tool_call_id: v.optional(v.string()),
  createdAt: v.optional(v.number()),
  content: v.string(),
  ui: v.optional(v.union(v.string(), v.null(), v.any())),
  role: Role,
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
  chatEmbeddings: defineTable({
    embedding: v.array(v.float64()),
    chatId: v.id("chat"),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["chatId"],
  }),
  chat: defineTable({
    userId: v.id("users"),
    url: v.string(),
    type: v.optional(v.string()),
    title: v.optional(v.string()),
    length: v.optional(v.number()),
    chat: v.optional(v.array(Message)),
    embeddingId: v.optional(v.array(v.id("chatEmbeddings"))),
  }).index("by_embedding", ["embeddingId"]),
});
