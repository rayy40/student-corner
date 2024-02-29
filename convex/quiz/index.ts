import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { Questions, Response } from "../schema";
import { fetchSummary } from "../openai";

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
      v.literal("files")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId));
    if (!user) {
      throw new ConvexError("You need to login first.");
    }
    const quizId = await ctx.db.insert("quiz", {
      userId: args.userId,
      questionNumber: args.questionNumber,
      content: args.content,
      kind: args.kind,
      format: args.format,
      status: "inProgress",
    });

    if (args?.kind === "files") {
      let url = await ctx.storage.getUrl(args?.content as Id<"_storage">);

      if (!url) {
        throw new ConvexError("No File found for this quiz Id.");
      }

      await ctx.scheduler.runAfter(0, internal.quiz.chunks.createChunks, {
        url,
        quizId,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.openai.generateQuiz, {
        quizId,
      });
    }
    return quizId;
  },
});

export const updateQuizStatus = internalMutation({
  args: {
    quizId: v.id("quiz"),
    status: v.union(
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.quizId, {
      status: "failed",
      error: args.error,
    });
  },
});

export const patchResponse = internalMutation({
  args: {
    quizId: v.id("quiz"),
    title: v.string(),
    response: Response,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.quizId, {
      response: args.response,
      title: args.title,
      status: "completed",
    });
  },
});

export const getQuizData = query({
  args: { quizId: v.string() },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId as Id<"quiz">);

    if (!quiz) {
      throw new ConvexError("No database found for this Id.");
    }

    if (!quiz.response) {
      return null;
    }

    return quiz;
  },
});

export const readQuizData = internalQuery({
  args: { quizId: v.id("quiz") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);

    return quiz;
  },
});

export const patchAnswer = mutation({
  args: {
    quizId: v.id("quiz"),
    questions: v.array(Questions),
    result: v.object({
      score: v.number(),
      correctAnswer: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const existingQuiz = await ctx.db.get(args.quizId);

    if (typeof existingQuiz?.response !== "object") {
      throw new ConvexError("Response type should only be objects.");
    }

    const updatedResponse = {
      ...existingQuiz.response,
      questions: args.questions,
    };
    await ctx.db.patch(args.quizId, {
      response: updatedResponse,
      result: args.result,
    });
  },
});

export const getQuizHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const quizes = await ctx.db
      .query("quiz")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    if (quizes.length === 0) {
      throw new ConvexError("No quiz history found.");
    }
    return quizes;
  },
});

export const generateSummary = internalAction({
  args: {
    quizId: v.id("quiz"),
    chunks: v.array(v.string()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      let content: string = "";
      for (let i = 0; i < args.chunks.length; i += 1) {
        content += await fetchSummary(args.chunks[i]);

        if (content.length === 0) {
          throw new ConvexError("Unable to generate summary from OpenAI.");
        }
      }

      await ctx.scheduler.runAfter(0, internal.openai.generateQuiz, {
        quizId: args.quizId,
        content,
      });
    } catch (error) {
      await ctx.runMutation(internal.quiz.index.updateQuizStatus, {
        quizId: args.quizId,
        status: "failed",
        error: (error as Error).message,
      });
    }
  },
});
