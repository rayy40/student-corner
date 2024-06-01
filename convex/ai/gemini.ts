import { generateObject, generateText } from "ai";
import { v } from "convex/values";
import { createUserPrompt } from "@/lib/utils";

import type { CreateUserPrompt } from "@/lib/types";
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
  },
  handler: async (ctx, { id }) => {
    try {
      const quiz = await ctx.runQuery(
        internal.quizify.quiz.getQuizTemporarily,
        {
          id,
        }
      );

      if (!quiz) {
        throw new Error("No quiz found");
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
        error: "Unable to generate the quiz.",
      });
    }
  },
});

export const summarizePDF = internalAction({
  args: {
    id: v.id("quiz"),
    url: v.string(),
  },
  handler: async (ctx, { id, url }) => {
    try {
      const content = await fetch(`https://r.jina.ai/${url}`, {
        method: "GET",
      })
        .then((res) => res.text())
        .catch((err) => {
          throw new Error(err.message);
        });

      const { text: summary } = await generateText({
        model: google("models/gemini-1.5-flash-latest"),
        system:
          "You are a text summarizer. You summarize the text provided so that questions can be prepared for the quiz.",
        prompt: "Summarize the following content: " + content,
      });

      await ctx.runMutation(internal.quizify.quiz.updateQuizWithSummary, {
        id,
        summary,
      });

      await ctx.scheduler.runAfter(0, internal.ai.gemini.generateQuiz, {
        id,
      });
    } catch (error) {
      await ctx.runMutation(internal.quizify.quiz.updateQuizStatus, {
        id,
        status: "failed",
        error: "Unable to summarise the PDF for generating the quiz.",
      });
    }
  },
});
