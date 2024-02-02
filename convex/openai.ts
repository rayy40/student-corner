import { ConvexError, Infer, v } from "convex/values";
import OpenAI, { toFile } from "openai";

import { createSystemPrompt, createUserPrompt } from "@/helpers/utils";
import { CreateUserPrompt } from "@/types";

import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import { Response } from "./schema";

type ResponseType = Infer<typeof Response>;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getResponseFromOpenAI = async ({
  format,
  questionNumber,
  content,
  kind,
}: CreateUserPrompt) => {
  const systemPrompt = createSystemPrompt(format);

  const userPrompt = createUserPrompt({
    format: format,
    questionNumber: questionNumber,
    content: content,
    kind: kind,
  });

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
    throw new ConvexError("Invalid response format from OpenAI.");
  }
  return response;
};

export const generateQuiz = internalAction({
  args: {
    quizId: v.id("quiz"),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.runQuery(internal.quiz.readQuizData, {
      quizId: args.quizId,
    });

    if (!quiz) {
      throw new ConvexError("No dataset found for this quiz Id.");
    }
    const response = await getResponseFromOpenAI({
      format: quiz?.format,
      questionNumber: quiz?.questionNumber,
      content:
        quiz?.kind === "document" ? (args.content as string) : quiz?.content,
      kind: quiz?.kind,
    });

    await ctx.runMutation(internal.quiz.patchResponse, {
      quizId: args.quizId,
      title: response.title ?? "Untitled",
      response: response,
    });
  },
});

export const fetchEmbedding = async (text: string[]) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  if (!response) {
    throw new ConvexError("Unable to create embeddings from Open AI.");
  }
  return response;
};

export const fetchTranscripts = async (audioStream: any) => {
  const response = await openai.audio.transcriptions.create({
    file: await toFile(audioStream, "myfile.mp3"),
    model: "whisper-1",
  });
  if (!response.text) {
    throw new ConvexError("Unable to fetch transcripts.");
  }
  return response.text;
};

export const fetchSummary = async (text: string) => {
  const prompt: { role: "user"; content: string } = {
    role: "user",
    content: `Extract the key facts out of this text. Don't include opinions. \nGive each fact a number and keep them short sentences. :\n\n ${text}`,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Add a maximum of 15 facts only. DO NOT EXCEED.",
      },
      prompt,
    ],
  });

  const response = completion.choices[0].message.content;

  return response;
};
