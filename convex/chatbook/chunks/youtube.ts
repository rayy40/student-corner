"use node";

import { ConvexError, v } from "convex/values";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { YoutubeTranscript } from "youtube-transcript";
import ytdl, { getBasicInfo, getURLVideoID, validateID } from "ytdl-core";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { fetchTranscripts } from "../../openai";

const extractAudioAndSplitChunks = async (url: string) => {
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
    chunkSize: 2000,
    chunkOverlap: 100,
  });
  const chunks = await splitter.createDocuments([transcript]);

  const chunkArr = chunks.map((chunk) => chunk.pageContent);
  return { chunkArr, title };
};

export const createChunks = internalAction({
  args: { chatId: v.id("chatbook"), url: v.string() },
  handler: async (ctx, args) => {
    try {
      const { chunkArr: chunks, title } = await extractAudioAndSplitChunks(
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
