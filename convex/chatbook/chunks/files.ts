"use node";

import { v } from "convex/values";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";

const extractTextandSplitChunks = async (url: string) => {
  const response: Response = await fetch(url);
  const blob: Blob = await response.blob();
  const loader: PDFLoader = new PDFLoader(blob, {
    parsedItemSeparator: "",
  });
  const docs = await loader.load();

  const title: string =
    docs?.[0]?.metadata?.pdf?.info?.title ??
    docs?.[0]?.metadata?.pdf?.info?.Title ??
    "PDF";

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 100,
  });

  const chunks = await splitter.splitDocuments(docs);
  const chunkArr = chunks.map((chunk) => chunk.pageContent);

  return { chunkArr, title };
};

export const createChunks = internalAction({
  args: {
    url: v.string(),
    chatId: v.id("chatbook"),
  },
  handler: async (ctx, args) => {
    try {
      const { chunkArr: chunks, title } = await extractTextandSplitChunks(
        args.url
      );

      for (let batchStart = 0; batchStart < chunks.length; batchStart += 100) {
        const batchEnd = Math.min(batchStart + 100, chunks.length);
        const batch = chunks.slice(batchStart, batchEnd);

        await ctx.runMutation(internal.helper.chunks.addChunks, {
          chatId: args.chatId,
          chunks: batch,
        });
      }

      await ctx.scheduler.runAfter(
        0,
        internal.chatbook.embedding.generateEmbeddings,
        {
          chatId: args.chatId,
          title,
        }
      );
    } catch (error) {
      await ctx.runMutation(internal.chatbook.index.updateChatbookStatus, {
        chatId: args.chatId,
        status: "failed",
        error: (error as Error).message,
      });
    }
  },
});
