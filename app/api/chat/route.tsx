import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse, Message } from "ai";
import { fetchAction, fetchMutation } from "convex/nextjs";
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
    const { messages, chatId } = await req.json();
    const previousMessage: string = messages[messages.length - 1].content;

    const content = await fetchAction(api.chatbook.similarContent, {
      chatId,
      query: previousMessage,
    });

    const prompt = {
      role: "system",
      content: `You are a helpful assistant. Your task is to answer questions related to the context provided to you. Please STRICTLY ADHERE to answering questions related to the content only and if a question is unrelated then refrain from giving an answer even if you know the answer and say 'I'm sorry but I do not know the answer to this query as it is unrelated to the content'. You will not apologize for previous responses. And process the response intelligently into markdown formatting for structure, without altering the contents.
  
      START CONTENT BLOCK
      ${content}
      END CONTENT BLOCK
    `,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
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
