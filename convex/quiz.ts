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
import { Questions, Response } from "./schema";
import { Id } from "./_generated/dataModel";
import { Infer } from "convex/values";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ResponseType = Infer<typeof Response>;

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

      const response: ResponseType = completion.choices[0].message.content
        ? JSON.parse(completion.choices[0].message.content)
        : undefined;

      if (!response || !response.title || !response.questions) {
        throw new Error("Invalid response format from OpenAI.");
      }
      await ctx.runMutation(internal.quiz.patchResponse, {
        quizId: args.quizId,
        response: response,
      });
    } catch (error) {
      console.error("Error while generating quiz from OpenAI:", error);
      await ctx.runMutation(internal.quiz.patchResponse, {
        quizId: args.quizId,
        response: "Error while generating quiz from OpenAI",
      });
    }
  },
});

export const patchResponse = internalMutation({
  args: {
    quizId: v.id("quiz"),
    response: v.union(Response, v.string()),
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
      return {
        quizData: undefined,
        fallbackData: undefined,
        isGeneratingQuiz: false,
        idNotFound: false,
        invalidQuizId: true,
      };
    }
    const quiz = await ctx.db.get(args.quizId as Id<"quiz">);

    return {
      quizData: typeof quiz?.response === "string" ? undefined : quiz,
      fallbackData: typeof quiz?.response === "string" ? quiz : undefined,
      isGeneratingQuiz: quiz?.response === undefined ? true : false,
      idNotFound: quiz ? false : true,
      invalidQuizId: false,
    };
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
      throw new Error("Response type should only be objects.");
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
    return quizes;
  },
});
