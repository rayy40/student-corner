import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { fetchAction, fetchMutation } from "convex/nextjs";
import OpenAI from "openai";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { generateRandomString } from "@/helpers/utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

interface PatchMessage {
  chatId: Id<"chatbook">;
  role: "user" | "assistant";
  content: string;
}

export const patchMessages = async ({
  chatId,
  role,
  content,
}: PatchMessage) => {
  await fetchMutation(api.chatbook.patchMessages, {
    chatId,
    message: {
      id: generateRandomString(),
      content,
      role,
    },
  });
};

export async function POST(req: Request) {
  try {
    const {
      messages,
      chatId,
    }: { messages: Message[]; chatId: Id<"chatbook"> } = await req.json();
    const previousMessage: string = messages[messages.length - 1].content;

    const content = await fetchAction(api.chatbook.similarContent, {
      chatId,
      query: previousMessage,
    });

    const prompt: { role: "system"; content: string } = {
      role: "system",
      content: `Your task is to provide answers strictly related to the following content. If a question is unrelated to the content, respond with 'I'm sorry, but I can only provide answers related to the provided content.' Do not apologize for previous responses. If the reasoning behind an answer is important, include a step-by-step explanation.

      ### START CONTENT BLOCK ###
      ${content}
      ### END CONTENT BLOCK ###
      
      Format your responses in MARKDOWN for structure, without altering the content.`,
    };

    const lastThreeMessages = messages.slice(-3);

    const formattedMessages = lastThreeMessages.map(({ role, content }) => ({
      role,
      content,
    })) as { role: "system" | "user" | "assistant"; content: string }[];

    formattedMessages.unshift(prompt);

    const response = await openai.chat.completions.create({
      temperature: 0.8,
      model: "gpt-3.5-turbo",
      stream: true,
      max_tokens: 3000,
      messages: formattedMessages,
    });

    const stream = OpenAIStream(response, {
      onStart: async () => {
        await patchMessages({ chatId, role: "user", content: previousMessage });
      },
      onCompletion: async (completion) => {
        await patchMessages({ chatId, role: "assistant", content: completion });
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log(error);
    return "Unable to get response.";
  }
}
