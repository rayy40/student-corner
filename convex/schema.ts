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
  v.literal("files")
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
  content: v.string(),
  ui: v.optional(v.union(v.string(), v.null(), v.any())),
  role: Role,
});

export const Github = v.object({
  name: v.string(),
  path: v.string(),
  html_url: v.optional(v.string()),
  content: v.optional(v.string()),
  download_url: v.optional(v.string()),
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
    status: v.union(
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("failed")
    ),
    response: v.optional(Response),
    result: v.optional(
      v.object({
        correctAnswer: v.number(),
        score: v.number(),
      })
    ),
    error: v.optional(v.string()),
  }),
  github: defineTable({
    chatId: v.id("chatbook"),
    name: v.string(),
    path: v.string(),
    html_url: v.optional(v.string()),
    content: v.optional(v.string()),
    download_url: v.optional(v.string()),
  }).index("by_chatId", ["chatId"]),
  chatbookChunks: defineTable({
    chatId: v.id("chatbook"),
    content: v.string(),
    embeddingId: v.optional(v.id("chatEmbeddings")),
  })
    .index("by_chatId", ["chatId"])
    .index("by_embeddingId", ["embeddingId"]),
  chatEmbeddings: defineTable({
    embedding: v.array(v.float64()),
    chunkId: v.id("chatbookChunks"),
    chatId: v.id("chatbook"),
  })
    .index("by_chunkId", ["chunkId"])
    .index("by_chatId", ["chatId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["chatId"],
    }),
  conversations: defineTable({
    chatId: v.id("chatbook"),
    messages: v.optional(v.array(Message)),
  }).index("by_chatId", ["chatId"]),
  chatbook: defineTable({
    userId: v.id("users"),
    dupChatId: v.optional(v.id("chatbook")),
    url: v.string(),
    domain: v.optional(v.string()),
    type: v.union(
      v.literal("codebase"),
      v.literal("youtube"),
      v.literal("files"),
      v.literal("documentation")
    ),
    title: v.optional(v.string()),
    status: v.union(
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  }).index("by_domain_type_status", ["domain", "status", "type"]),
});
