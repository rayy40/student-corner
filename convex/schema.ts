import { defineSchema, defineTable } from "convex/server";
import { Validator, v } from "convex/values";

export const QuizFormat = v.union(
  v.literal("mcq"),
  v.literal("name the following"),
  v.literal("true/false")
);
export const QuizKind = v.union(
  v.literal("topic"),
  v.literal("paragraph"),
  v.literal("files")
);
export const Role = v.union(
  v.literal("system"),
  v.literal("user"),
  v.literal("assistant"),
  v.literal("function"),
  v.literal("data"),
  v.literal("tool")
);
export const Status = v.union(
  v.literal("inProgress"),
  v.literal("completed"),
  v.literal("failed")
);
export const ChatKind = v.union(
  v.literal("codebase"),
  v.literal("youtube"),
  v.literal("files"),
  v.literal("documentation")
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

export const userSchema = {
  email: v.string(),
  password: v.optional(v.string()),
  name: v.optional(v.string()),
  emailVerified: v.optional(v.number()),
  image: v.optional(v.string()),
};

export const sessionSchema = {
  userId: v.id("users"),
  expires: v.number(),
  sessionToken: v.string(),
};

export const accountSchema = {
  userId: v.id("users"),
  type: v.union(
    v.literal("email"),
    v.literal("oidc"),
    v.literal("oauth"),
    v.literal("webauthn")
  ),
  provider: v.string(),
  providerAccountId: v.string(),
  refresh_token: v.optional(v.string()),
  access_token: v.optional(v.string()),
  expires_at: v.optional(v.number()),
  token_type: v.optional(v.string() as Validator<Lowercase<string>>),
  scope: v.optional(v.string()),
  id_token: v.optional(v.string()),
  session_state: v.optional(v.string()),
};

export const verificationTokenSchema = {
  identifier: v.string(),
  token: v.string(),
  expires: v.number(),
};

export const twoFactorAuthenticationSchema = {
  email: v.string(),
  code: v.string(),
  expires: v.number(),
};

export const authenticatorSchema = {
  credentialID: v.string(),
  userId: v.id("users"),
  providerAccountId: v.string(),
  credentialPublicKey: v.string(),
  counter: v.number(),
  credentialDeviceType: v.string(),
  credentialBackedUp: v.boolean(),
  transports: v.optional(v.string()),
};

const authTables = {
  users: defineTable(userSchema).index("email", ["email"]),
  sessions: defineTable(sessionSchema)
    .index("sessionToken", ["sessionToken"])
    .index("userId", ["userId"]),
  accounts: defineTable(accountSchema)
    .index("providerAndAccountId", ["provider", "providerAccountId"])
    .index("userId", ["userId"]),
  twoFactorAuthentication: defineTable(twoFactorAuthenticationSchema)
    .index("email", ["email"])
    .index("code", ["code"]),
  verificationTokens: defineTable(verificationTokenSchema)
    .index("identifier", ["identifier"])
    .index("token", ["token"])
    .index("identifierToken", ["identifier", "token"]),
  authenticators: defineTable(authenticatorSchema)
    .index("userId", ["userId"])
    .index("credentialID", ["credentialID"]),
};

const quizSchema = {
  userId: v.id("users"),
  numberOfQuestions: v.number(),
  content: v.string(),
  format: QuizFormat,
  kind: QuizKind,
  status: Status,
  response: v.optional(Response),
  score: v.optional(v.number()),
  error: v.optional(v.string()),
};

const githubSchema = {
  chatId: v.id("chatbook"),
  name: v.string(),
  path: v.string(),
  html_url: v.optional(v.string()),
  content: v.optional(v.string()),
  download_url: v.optional(v.string()),
};

const chatbookSchema = {
  userId: v.id("users"),
  dupChatId: v.optional(v.id("chatbook")),
  url: v.string(),
  domain: v.optional(v.string()),
  type: ChatKind,
  title: v.optional(v.string()),
  status: Status,
  error: v.optional(v.string()),
};

const chatEmbeddingsSchema = {
  embedding: v.array(v.float64()),
  chunkId: v.id("chatbookChunks"),
  chatId: v.id("chatbook"),
};

const chatbookChunksSchema = {
  chatId: v.id("chatbook"),
  content: v.string(),
  embeddingId: v.optional(v.id("chatEmbeddings")),
};

export default defineSchema({
  ...authTables,

  quiz: defineTable(quizSchema).index("by_userId", ["userId"]),

  github: defineTable(githubSchema).index("by_chatId", ["chatId"]),

  chatbookChunks: defineTable(chatbookChunksSchema)
    .index("by_chatId", ["chatId"])
    .index("by_embeddingId", ["embeddingId"]),

  chatEmbeddings: defineTable(chatEmbeddingsSchema)
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

  chatbook: defineTable(chatbookSchema).index("by_domain_type_status", [
    "domain",
    "status",
    "type",
  ]),
});
