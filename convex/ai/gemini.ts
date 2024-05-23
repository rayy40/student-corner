import { generateObject } from "ai";
import { ConvexError, v } from "convex/values";

import { createUserPrompt } from "@/helpers/utils";
import { CreateUserPrompt } from "@/lib/types";
import { google } from "@ai-sdk/google";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import {
  mcqOrTrueFalseResult,
  nameTheFollowingResult,
} from "@/schema/ai_response_schema";

export const getResponseFromGemini = async (props: CreateUserPrompt) => {
  const schema =
    props.format === "name the following"
      ? nameTheFollowingResult
      : mcqOrTrueFalseResult;

  try {
    const { object } = await generateObject({
      model: google("models/gemini-1.5-flash-latest"),
      schema,
      system:
        "You are a quiz generator. You generate quiz based on the topic provided for students to reimburse their knowledge.",
      prompt: createUserPrompt(props),
    });

    return { success: object };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export const generateQuiz = internalAction({
  args: {
    id: v.id("quiz"),
    content: v.optional(v.string()),
  },
  handler: async (ctx, { id, content }) => {
    try {
      const quiz = await ctx.runQuery(
        internal.quizify.quiz.getQuizTemporarily,
        {
          id,
        }
      );

      if (!quiz) {
        throw new ConvexError("No quiz found");
      }

      const response = await getResponseFromGemini(quiz);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.success) {
        const { success } = response;

        await ctx.runMutation(internal.quizify.quiz.updateQuizStatus, {
          id,
          response: success,
          status: "inProgress",
        });
      }
    } catch (error) {
      await ctx.runMutation(internal.quizify.quiz.updateQuizStatus, {
        id,
        status: "failed",
        error: (error as Error).message,
      });
    }
  },
});
