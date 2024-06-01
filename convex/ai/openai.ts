import { ConvexError } from "convex/values";
import OpenAI, { toFile } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const fetchTranscripts = async (audioStream: any) => {
  const response = await openai.audio.transcriptions.create({
    file: await toFile(audioStream, "myfile.mp3"),
    model: "whisper-1",
  });
  if (!response.text) {
    throw new ConvexError("Unable to fetch transcripts.");
  }
  return response.text;
};

export const fetchSummary = async (text: string) => {
  const prompt: { role: "user"; content: string } = {
    role: "user",
    content: `Extract the key facts out of this text. Don't include opinions. \nGive each fact a number and keep them short sentences. :\n\n ${text}`,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Add a maximum of 15 facts only. DO NOT EXCEED.",
      },
      prompt,
    ],
  });

  const response = completion.choices[0].message.content;

  return response;
};
