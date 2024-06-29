import { convertToCoreMessages, streamText } from "ai";

import { semanticSearch } from "@/db/chat";
import { google } from "@ai-sdk/google";
import { codeTemplate, ragTemplate } from "@/lib/format";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, chatId, type } = await req.json();

  const query: string = messages[messages.length - 1].content;

  const content = await semanticSearch(chatId, query);

  if (!content) {
    return new Response("No content found", {
      status: 404,
      statusText: "No content found",
    });
  }

  if ("error" in content) {
    return new Response(content.error, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  let system = "";
  if (type !== "github") {
    system = ragTemplate(content, type);
  } else {
    system = codeTemplate(content);
  }

  const result = await streamText({
    model: google("models/gemini-1.5-flash-latest"),
    system,
    messages: convertToCoreMessages(messages),
  });

  return result.toAIStreamResponse();
}
