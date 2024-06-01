import { v } from "convex/values";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const extractTextsFromFile = internalAction({
  args: {
    chatId: v.id("chatbook"),
    url: v.string(),
  },
  handler: async (ctx, { chatId, url }) => {
    try {
      const response: any = await fetch(`https://r.jina.ai/${url}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to fetch PDF");
      }

      const json = await response.json();

      const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 2000,
        chunkOverlap: 200,
      });

      const chunks = await splitter.splitText(json.data.content);

      await ctx.scheduler.runAfter(0, internal.chatbook.chunks.insertChunks, {
        chatId,
        chunks,
        title: json.data.title,
      });
    } catch (error) {
      await ctx.runMutation(internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "failed",
        error: "Unable to parse through PDF.",
      });
    }
  },
});
