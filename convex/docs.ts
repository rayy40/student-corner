"use node";

import { ConvexError, v } from "convex/values";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { YoutubeTranscript } from "youtube-transcript";
import ytdl, { getBasicInfo, getURLVideoID, validateID } from "ytdl-core";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { fetchTranscripts } from "./openai";
import { Id } from "./_generated/dataModel";
import { Chunk } from "@/types";

const extractTextandSplitChunks = async (url: string, size: number) => {
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

  const chunkArr: { content: string; source: string }[] = [];
  const document = docs.map((doc) => doc.pageContent);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: size,
    chunkOverlap: 100,
  });

  if (size > 1000) {
    const chunks = splitChunkManually(document, size);
    return { chunks, title };
  } else {
    const chunks = await splitter.splitDocuments(docs);
    for (const chunk of chunks) {
      chunkArr.push({
        content: chunk?.pageContent,
        source: chunk?.metadata?.loc?.pageNumber.toString() ?? "",
      });
    }
    return { chunkArr, title };
  }
};

const extractAudioAndSplitChunks = async (url: string, size: number) => {
  const videoId = getURLVideoID(url);

  if (!validateID(videoId)) {
    throw new ConvexError("Invalid video Id.");
  }

  const metadata = await getBasicInfo(videoId);
  const title = metadata?.videoDetails?.title;

  let transcript: string = "";
  try {
    const response = await YoutubeTranscript.fetchTranscript(videoId);
    transcript += response.map((text) => text.text);
  } catch (error) {
    console.warn(
      "Transcript fetch failed, falling back to audio transcription"
    );

    const audioStream = await ytdl(url, { filter: "audioonly" });
    if (!audioStream) {
      throw new ConvexError("Unable to extract audio stream from video.");
    }

    transcript = await fetchTranscripts(audioStream);
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: size,
    chunkOverlap: 100,
  });
  const chunks = await splitter.createDocuments([transcript]);

  const chunkArr = chunks.map((chunk) => chunk.pageContent);
  return { chunkArr, title };
};

const splitChunkManually = (docs: string[], size: number) => {
  const chunkArr: string[] = [];
  let text: string = "";
  for (let i = 0; i < docs.length; i++) {
    text += docs[i];
  }
  while (text) {
    const chunk = text.slice(0, size);
    chunkArr.push(chunk);
    text = text.slice(size);
  }
  return chunkArr;
};

export const createChunks = internalAction({
  args: {
    url: v.string(),
    isGenerateEmbeddings: v.boolean(),
    chunkSize: v.number(),
    id: v.union(v.id("chatbook"), v.id("quiz")),
    kind: v.union(v.literal("doc"), v.literal("video")),
  },
  handler: async (ctx, args) => {
    const chunks =
      args.kind === "doc"
        ? await extractTextandSplitChunks(args.url, args.chunkSize)
        : await extractAudioAndSplitChunks(args.url, args.chunkSize);

    if (!args.isGenerateEmbeddings) {
      await ctx.scheduler.runAfter(0, internal.quiz.generateSummary, {
        quizId: args.id as Id<"quiz">,
        chunks: chunks.chunkArr as string[],
        title: chunks.title,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.chatbook.generateEmbeddings, {
        chatId: args.id as Id<"chatbook">,
        chunks: chunks.chunkArr as Chunk[],
        title: chunks.title,
        type: args.kind,
      });
    }
  },
});
