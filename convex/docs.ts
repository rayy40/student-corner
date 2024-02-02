"use node";

import { ConvexError, v } from "convex/values";
import { Document } from "langchain/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { YoutubeTranscript } from "youtube-transcript";
import ytdl, { getBasicInfo, getURLVideoID, validateID } from "ytdl-core";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { fetchTranscripts } from "./openai";
import { Id } from "./_generated/dataModel";

const extractText = async (url: string) => {
  let document: string[] = [];

  const response: Response = await fetch(url);
  const blob: Blob = await response.blob();
  const loader: PDFLoader = new PDFLoader(blob, {
    parsedItemSeparator: "",
  });
  const docs: Document<Record<string, any>>[] = await loader.load();

  const title: string =
    docs?.[0]?.metadata?.pdf?.info?.title ??
    docs?.[0]?.metadata?.pdf?.info?.Title ??
    "PDF";

  const type: string = docs?.[0]?.metadata?.blobType;

  docs.forEach((doc) => {
    document.push(doc.pageContent);
  });

  return { document, title, type };
};

const extractAudio = async (url: string) => {
  const videoId = getURLVideoID(url);

  if (!validateID(videoId)) {
    throw new ConvexError("Invalid video Id.");
  }

  const metadata = await getBasicInfo(videoId);
  const title = metadata?.videoDetails?.title;
  const type = "Youtube Video";

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
  return { transcript, title, type };
};

const splitChunkManually = (
  docs: string[],
  size: number,
  chunkArr: string[]
) => {
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

const createChunks = async (
  url: string,
  kind: "pdf" | "audio",
  size: number
): Promise<{ chunks: string[]; title: string; type: string } | string> => {
  const extractTextFn = kind === "pdf" ? extractText : extractAudio;
  const response = await extractTextFn(url);

  if (typeof response === "string") {
    throw new ConvexError(response);
  }

  let docs: string[];

  if ("document" in response) {
    docs = response.document;
  } else {
    docs = [response.transcript];
  }

  let chunkArr: string[] = [];

  if (size > 1000) {
    chunkArr = splitChunkManually(docs, size, chunkArr);
  } else {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: size,
      chunkOverlap: 100,
    });
    const chunks = await splitter.createDocuments(docs);

    chunkArr = chunks.map((chunk) => chunk.pageContent);
  }

  return { chunks: chunkArr, title: response.title, type: response.type };
};

export const extractTextAndCreateChunks = internalAction({
  args: {
    url: v.string(),
    isGenerateEmbeddings: v.boolean(),
    chunkSize: v.number(),
    id: v.union(v.id("chatbook"), v.id("quiz")),
    kind: v.union(v.literal("pdf"), v.literal("audio")),
  },
  handler: async (ctx, args) => {
    const chunks = await createChunks(args.url, args.kind, args.chunkSize);

    if (typeof chunks === "string") {
      throw new ConvexError(chunks);
    }

    if (!args.isGenerateEmbeddings) {
      await ctx.scheduler.runAfter(0, internal.quiz.generateSummary, {
        quizId: args.id as Id<"quiz">,
        chunks: chunks.chunks,
        title: chunks.title,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.chatbook.generateEmbeddings, {
        chatId: args.id as Id<"chatbook">,
        chunks: chunks.chunks,
        title: chunks.title,
        type: chunks.type,
      });
    }
  },
});

export const extractImportantTexts = () => {};
