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

const extractText = async (url: string) => {
  try {
    let document: string[] = [];

    const response: Response = await fetch(url);
    const blob: Blob = await response.blob();
    const loader: PDFLoader = new PDFLoader(blob, {
      parsedItemSeparator: "",
    });
    const docs: Document<Record<string, any>>[] = await loader.load();

    const title: string = docs?.[0]?.metadata?.pdf?.info?.title ?? "PDF";
    const type: string = docs?.[0]?.metadata?.blobType;

    docs.forEach((doc) => {
      document.push(doc.pageContent);
    });

    return { document, title, type };
  } catch (error) {
    console.error(error);
    return "Unable to extract text from PDF.";
  }
};

const extractAudio = async (url: string) => {
  try {
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
  } catch (error) {
    return error instanceof ConvexError
      ? error.data
      : "Unexpected error occured.";
  }
};

const createChunks = async (
  url: string,
  kind: "pdf" | "audio"
): Promise<{ chunks: string[]; title: string; type: string } | string> => {
  try {
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

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments(docs);

    const chunkArr = chunks.map((chunk) => chunk.pageContent);

    return { chunks: chunkArr, title: response.title, type: response.type };
  } catch (error) {
    return error instanceof ConvexError
      ? error.data
      : "Unexpected error occured.";
  }
};

export const extractTextAndCreateChunks = internalAction({
  args: {
    url: v.string(),
    chatId: v.id("chatbook"),
    kind: v.union(v.literal("pdf"), v.literal("audio")),
  },
  handler: async (ctx, args) => {
    try {
      const chunks = await createChunks(args.url, args.kind);

      if (typeof chunks == "string") {
        throw new ConvexError(chunks);
      }

      await ctx.scheduler.runAfter(0, internal.chatbook.generateEmbeddings, {
        chatId: args.chatId,
        chunks: chunks.chunks,
        title: chunks.title,
        type: chunks.type,
      });
    } catch (error) {
      return error instanceof ConvexError
        ? error.data
        : "Unexpected error occured.";
    }
  },
});
