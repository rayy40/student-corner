"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { internal } from "../_generated/api";

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

  const document = docs.map((doc) => doc.pageContent);

  const chunkArr = splitChunk(document);
  return { chunkArr, title };
};

const splitChunk = (docs: string[]) => {
  const chunkArr: string[] = [];
  let text: string = "";
  for (let i = 0; i < docs.length; i++) {
    text += docs[i];
  }
  while (text) {
    const chunk = text.slice(0, 4000);
    chunkArr.push(chunk);
    text = text.slice(4000);
  }
  return chunkArr;
};

export const createChunks = internalAction({
  args: {
    url: v.string(),
    quizId: v.id("quiz"),
  },
  handler: async (ctx, args) => {
    try {
      const { chunkArr: chunks, title } = await extractTextandSplitChunks(
        args.url
      );

      await ctx.scheduler.runAfter(0, internal.quiz.index.generateSummary, {
        quizId: args.quizId,
        chunks: chunks,
        title,
      });
    } catch (error) {
      await ctx.runMutation(internal.quiz.index.updateQuizStatus, {
        quizId: args.quizId,
        status: "failed",
        error: (error as Error).message,
      });
    }
  },
});
