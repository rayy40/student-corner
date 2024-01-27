"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { internal } from "./_generated/api";

const createChunks = async (url: string) => {
  try {
    const response: Response = await fetch(url);
    const blob: Blob = await response.blob();
    const loader: PDFLoader = new PDFLoader(blob);
    const docs: Document<Record<string, any>>[] = await loader.load();

    const metadata = docs[0].metadata;

    const splitter = new RecursiveCharacterTextSplitter({
      separators: ["\n"],
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    let document: string[] = [];

    docs.forEach((doc) => {
      document.push(doc.pageContent);
    });

    const chunks = await splitter.createDocuments(document);

    const chunkArr = chunks.map((chunk) => chunk.pageContent);

    return { chunks: chunkArr, metadata: metadata };
  } catch (error) {
    console.log(error);
    return "Unable to parse through file.";
  }
};

export const extractTextAndCreateChunks = internalAction({
  args: { url: v.string(), chatId: v.id("chat") },
  handler: async (ctx, args) => {
    try {
      const chunks = await createChunks(args.url);

      if (typeof chunks == "string") {
        throw new Error(chunks);
      }

      await ctx.scheduler.runAfter(0, internal.chatbook.generateEmbeddings, {
        chatId: args.chatId,
        chunks: chunks.chunks,
        metadata: chunks.metadata,
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  },
});
