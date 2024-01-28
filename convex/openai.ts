import { Infer, v } from "convex/values";
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
    return response;
  } catch (error) {
    console.error(error);
    return "Error while generating quiz from OpenAI.";
  }
};

const uploadFile = async (
  url: string,
  format: FormatType,
  questions: number
) => {
  try {
    const file = await openai.files.create({
      file: await fetch(url),
      purpose: "assistants",
    });
    if (file.id) {
      return createAssistant(file.id, format, questions);
    }
  } catch (error) {
    console.error(error);
    return "Error while uploading file to OpenAI.";
  }
};

const createAssistant = async (
  fileId: string,
  format: FormatType,
  quesitons: number
) => {
  try {
    const assistant = await openai.beta.assistants.create({
      name: "Quiz Generator",
      instructions: `You are a quiz generator, whose task is to generate quiz and provide a suitable title for the quiz (excluding the word Quiz), based on the file provided.`,
      model: "gpt-3.5-turbo-1106",
      tools: [{ type: "retrieval" }],
      file_ids: [fileId],
    });
    if (assistant.id) {
      return createThreadAndRun(format, fileId, assistant.id, quesitons);
    }
  } catch (error) {
    console.error(error);
    return "Error while creating an assistant.";
  }
};

const createThreadAndRun = async (
  format: FormatType,
  fileId: string,
  assistantId: string,
  quesitons: number
) => {
  try {
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
    if (run.id) {
      return await startPolling(run.id, run.thread_id);
    }
  } catch (error) {
    console.error(error);
    return "Error while creating thread.";
  }
};

const startPolling = async (runId: string, threadId: string) => {
  if (!threadId) return;
  console.log("Start polling");

  let baseTimeout = 20000; // Initial timeout duration
  let currentTimeout = baseTimeout; // Current timeout duration

  while (true) {
    try {
      const response = await openai.beta.threads.runs.retrieve(threadId, runId);
      console.log(response);
      if (
        ["cancelled", "failed", "completed", "expired"].includes(
          response.status
        )
      ) {
        const completion = await openai.beta.threads.messages.list(threadId);
        console.log(completion.data);
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
    } catch (error) {
      console.error("Error polling run status:", error);
      return "Error polling run status";
    }
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
      throw new Error("No dataset found for this quiz Id.");
    }

    if (quiz?.kind === "document") {
      let url = await ctx.runQuery(internal.files.getFileUrl, {
        storageId: quiz?.content as Id<"_storage">,
      });
      console.log(url);

      if (url === "No Url Found.") {
        throw new Error("No File found for this quiz Id.");
      }
      const response = await uploadFile(
        url,
        quiz?.format,
        quiz?.questionNumber
      );
      console.log(response);
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
      console.log(response);
      if (response === "Error while generating quiz from OpenAI.") {
        await ctx.runMutation(internal.quiz.patchResponse, {
          quizId: args.quizId,
          response: response,
        });
      } else {
        await ctx.runMutation(internal.quiz.patchResponse, {
          quizId: args.quizId,
          response: response,
        });
      }
    }
  },
});

export const fetchEmbedding = async (text: string[]) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response;
};

export const fetchTranscripts = async (audioStream: any) => {
  const response = await openai.audio.transcriptions.create({
    file: await toFile(audioStream, "myfile.mp3"),
    model: "whisper-1",
  });
  return response.text;
};
