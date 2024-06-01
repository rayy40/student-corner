"use node";

import { v } from "convex/values";
import { YoutubeTranscript } from "youtube-transcript";
import { getBasicInfo, getURLVideoID, validateID } from "ytdl-core";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const transcribeVideos = internalAction({
  args: { chatId: v.id("chatbook"), url: v.string() },
  handler: async (ctx, { chatId, url }) => {
    try {
      const videoId = getURLVideoID(url);

      if (!validateID(videoId)) {
        throw new Error("Invalid Youtube video Id.");
      }

      const metadata = await getBasicInfo(videoId);
      const title = metadata.videoDetails.title;

      let transcript = "";
      const response = await YoutubeTranscript.fetchTranscript(videoId);
      transcript += response.map((text) => text.text);

      await ctx.scheduler.runAfter(0, internal.chatbook.chunks.createChunks, {
        chatId,
        text: transcript,
        title,
      });
    } catch (error) {
      await ctx.scheduler.runAfter(0, internal.chatbook.chat.updateChatStatus, {
        chatId,
        status: "failed",
        error: "Unable to generate transcripts from the video.",
      });
    }
  },
});
