import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createQuiz = mutation({
  args: {
    userId: v.id("users"),
    questionNumber: v.number(),
    content: v.string(),
    format: v.union(
      v.literal("mcq"),
      v.literal("name"),
      v.literal("true_false")
    ),
    kind: v.union(
      v.literal("topic"),
      v.literal("paragraph"),
      v.literal("document")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId));
    console.log(user);
    if (!user) {
      throw new Error("You need to login first.");
    }
    const quizId = await ctx.db.insert("quiz", {
      userId: args.userId,
      questionNumber: args.questionNumber,
      content: args.content,
      kind: args.kind,
      format: args.format,
    });
    return quizId;
  },
});
