import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { Questions, QuizFormat, QuizKind, Response, Status } from "../schema";
import { Id } from "../_generated/dataModel";

export const createQuiz = mutation({
  args: {
    userId: v.id("users"),
    questions: v.number(),
    content: v.string(),
    format: QuizFormat,
    kind: QuizKind,
  },
  handler: async (ctx, { userId, questions, content, format, kind }) => {
    //TODO: check if user is authenticated

    const id = await ctx.db.insert("quiz", {
      userId,
      numberOfQuestions: questions,
      content,
      kind,
      format,
      status: "inProgress",
    });

    if (!id) {
      throw new ConvexError("Quiz creation failed.");
    }

    if (kind === "files") {
      const url = await ctx.storage.getUrl(content as Id<"_storage">);

      if (!url) {
        throw new ConvexError("No File found for this quiz Id.");
      }

      await ctx.scheduler.runAfter(0, internal.ai.gemini.summarizePDF, {
        id,
        url,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.ai.gemini.generateQuiz, {
        id,
      });
    }
    return id;
  },
});

export const getQuiz = query({
  args: { id: v.id("quiz") },
  handler: async (ctx, { id }) => {
    const quiz = await ctx.db.get(id);

    if (quiz) {
      if (!quiz.response && quiz.status === "inProgress") {
        return { loading: true };
      }
      return { success: quiz, loading: false };
    } else {
      return { error: "No quiz found.", loading: false };
    }
  },
});

export const getQuizTemporarily = internalQuery({
  args: { id: v.id("quiz") },
  handler: async (ctx, { id }) => {
    const quiz = await ctx.db.get(id);

    if (quiz) {
      return quiz;
    } else {
      return null;
    }
  },
});

export const updateQuizStatus = internalMutation({
  args: {
    id: v.id("quiz"),
    status: Status,
    response: v.optional(Response),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { id, error, response, status }) => {
    if (response && status === "inProgress") {
      await ctx.db.patch(id, {
        response,
        status: "completed",
      });
    } else if (status === "failed") {
      await ctx.db.patch(id, {
        status: "failed",
        error: error,
      });
    }
  },
});

export const updateAnswers = mutation({
  args: {
    id: v.id("quiz"),
    userAnswers: v.array(Questions),
    score: v.number(),
  },
  handler: async (ctx, { id, userAnswers, score }) => {
    const quiz = await ctx.db.get(id);

    if (!quiz) {
      return { error: "No quiz found." };
    }

    if (quiz.status === "failed") {
      return { error: "Unable to update answers." };
    }

    if (quiz.status === "inProgress") {
      return { error: "Please try again after some time." };
    }

    if (!quiz.response) {
      return { error: "No response generated from Open AI." };
    }

    const updatedResponse = {
      ...quiz.response,
      questions: userAnswers,
    };

    await ctx.db.patch(id, {
      response: updatedResponse,
      score,
    });
  },
});

export const updateQuizWithSummary = internalMutation({
  args: {
    id: v.id("quiz"),
    summary: v.string(),
  },
  handler: async (ctx, { id, summary }) => {
    await ctx.db.patch(id, {
      content: summary,
    });
  },
});

export const getQuizHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const quizHistory = await ctx.db
      .query("quiz")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();

    return quizHistory;
  },
});
