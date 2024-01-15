import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import {
  createSystemPrompt,
  createUserPrompt,
  isValidQuizId,
} from "@/helpers/utils";
import { Response } from "./schema";
import { Id } from "./_generated/dataModel";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    ctx.scheduler.runAfter(0, internal.quiz.generateQuiz, {
      quizId,
    });
    return quizId;
  },
});

export const readQuizData = internalQuery({
  args: {
    quizId: v.id("quiz"),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    return quiz;
  },
});

export const generateQuiz = internalAction({
  args: {
    quizId: v.id("quiz"),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.runQuery(internal.quiz.readQuizData, {
      quizId: args.quizId,
    });

    if (!quiz) {
      throw new Error("No dataset found for this quiz id.");
    }

    const systemPrompt = createSystemPrompt({
      format: quiz?.format,
    });

    const userPrompt = createUserPrompt({
      format: quiz?.format,
      questionNumber: quiz?.questionNumber,
      content: quiz?.content,
      kind: quiz?.kind,
    });

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "gpt-3.5-turbo",
      });

      console.log(completion);

      const response: Response = JSON.parse(
        completion.choices[0].message.content ?? ""
      );

      console.log(response);

      await ctx.runMutation(internal.quiz.patchResponse, {
        quizId: args.quizId,
        response: Array.isArray(response)
          ? response
          : "Unable to generate a quiz at this time.",
      });
    } catch (error) {
      console.error("Error fetching completion:", error);
      throw new Error("Error while geenrating quiz.");
    }
  },
});

export const patchResponse = internalMutation({
  args: {
    quizId: v.id("quiz"),
    response: v.union(v.array(Response), v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.quizId, {
      response: args.response,
    });
  },
});

export const getQuizData = query({
  args: { quizId: v.string() },
  handler: async (ctx, args) => {
    if (!isValidQuizId(args.quizId)) {
      const err = true;
      return { err };
    }
    const quiz = await ctx.db.get(args.quizId as Id<"quiz">);
    const fallback = "No database found for this Id.";
    return { quiz, fallback };
  },
});

export const patchAnswer = mutation({
  args: { quizId: v.id("quiz"), response: v.array(Response) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.quizId, {
      response: args.response,
    });
  },
});
