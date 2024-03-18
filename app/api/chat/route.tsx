import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { fetchAction, fetchMutation } from "convex/nextjs";
import OpenAI from "openai";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { generateRandomString } from "@/helpers/utils";
import { codeTemplate, ragTemplate } from "@/helpers/format";

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
  await fetchMutation(api.chatbook.conversations.patchMessages, {
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
      dupChatId,
      chatId,
      type,
    }: {
      messages: Message[];
      dupChatId?: Id<"chatbook">;
      chatId: Id<"chatbook">;
      type: "code" | "video" | "doc";
    } = await req.json();
    const previousMessage: string = messages[messages.length - 1].content;

    const content = await fetchAction(api.search.semanticSearch, {
      chatId: dupChatId ? dupChatId : chatId,
      query: previousMessage,
    });

    if (typeof content === "string") {
      return new Response(content, {
        status: 200,
      });
    }

    const lastThreeMessages = messages.slice(-3);

    const formattedMessages = lastThreeMessages.map(({ role, content }) => ({
      role,
      content,
    })) as { role: "system" | "user" | "assistant"; content: string }[];

    const prompt =
      type === "code" ? codeTemplate(content) : ragTemplate(content, type);

    formattedMessages.unshift(prompt);

    const response = await openai.chat.completions.create({
      temperature: 0.8,
      model: "gpt-3.5-turbo-1106",
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
