import { ConvexError, Infer, v } from "convex/values";
import OpenAI, { toFile } from "openai";

import {
  createSystemPrompt,
  createUserPrompt,
  JSONFormat,
} from "@/helpers/utils";
import { CreateUserPrompt, FormatType } from "@/types";

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

const uploadFile = async (
  url: string,
  format: FormatType,
  questions: number
) => {
  const file = await openai.files.create({
    file: await fetch(url),
    purpose: "assistants",
  });
  if (!file.id) {
    throw new ConvexError("Error while uploading file to OpenAI.");
  }
  if (file.id) {
    return createAssistant(file.id, format, questions);
  }
};

const createAssistant = async (
  fileId: string,
  format: FormatType,
  quesitons: number
) => {
  const assistant = await openai.beta.assistants.create({
    name: "Quiz Generator",
    instructions: `You are a quiz generator, whose task is to generate quiz and provide a suitable title for the quiz (excluding the word Quiz), based on the file provided.`,
    model: "gpt-3.5-turbo-1106",
    tools: [{ type: "retrieval" }],
    file_ids: [fileId],
  });
  if (!assistant.id) {
    throw new ConvexError("Error while creating an assistant.");
  }
  if (assistant.id) {
    return createThreadAndRun(format, fileId, assistant.id, quesitons);
  }
};

const createThreadAndRun = async (
  format: FormatType,
  fileId: string,
  assistantId: string,
  quesitons: number
) => {
  const run = await openai.beta.threads.createAndRun({
    assistant_id: assistantId,
    thread: {
      messages: [
        {
          role: "user",
          content: `Generate ${quesitons} ${format} type questions. And format the response as the example format given - ${JSON.stringify(
            JSONFormat(format)
          )}.`,
          file_ids: [fileId],
        },
      ],
    },
  });
  if (!run.id) {
    throw new ConvexError("Error while creating thread.");
  }
  if (run.id) {
    return await startPolling(run.id, run.thread_id);
  }
};

const startPolling = async (runId: string, threadId: string) => {
  if (!threadId) return;

  let baseTimeout = 20000; // Initial timeout duration
  let currentTimeout = baseTimeout; // Current timeout duration

  while (true) {
    const response = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (!response) {
      throw new ConvexError("Error while retrieving run.");
    }

    if (
      ["cancelled", "failed", "completed", "expired"].includes(response.status)
    ) {
      const completion = await openai.beta.threads.messages.list(threadId);

      if (!completion.data) {
        throw new ConvexError("Error while retrieving messages.");
      }

      return completion.data[0].content;
    }

    // If status is "in_progress", double the timeout duration
    if (response.status === "in_progress") {
      currentTimeout *= 2;
    } else {
      // Reset the timeout duration to the base value if not "in_progress"
      currentTimeout = baseTimeout;
    }
    // Wait for 5 second before checking the status again
    await new Promise((resolve) => setTimeout(resolve, currentTimeout));
  }
};

export const generateQuiz = internalAction({
  args: {
    quizId: v.id("quiz"),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.runQuery(internal.quiz.readQuizData, {
      quizId: args.quizId,
    });

    if (!quiz) {
      throw new ConvexError("No dataset found for this quiz Id.");
    }

    if (quiz?.kind === "document") {
      let url = await ctx.runQuery(internal.files.getFileUrl, {
        storageId: quiz?.content as Id<"_storage">,
      });

      if (url === "No Url Found.") {
        throw new ConvexError("No File found for this quiz Id.");
      }
      const response = await uploadFile(
        url,
        quiz?.format,
        quiz?.questionNumber
      );

      await ctx.runMutation(internal.quiz.patchResponse, {
        quizId: args.quizId,
        response: response,
      });
    } else {
      const response = await getResponseFromOpenAI({
        format: quiz?.format,
        questionNumber: quiz?.questionNumber,
        content: quiz?.content,
        kind: quiz?.kind,
      });

      await ctx.runMutation(internal.quiz.patchResponse, {
        quizId: args.quizId,
        response: response,
      });
    }
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
