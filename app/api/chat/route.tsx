import { Message, StreamingTextResponse } from "ai";
import { PromptTemplate } from "langchain/prompts";
import { BytesOutputParser } from "langchain/schema/output_parser";
import { ChatOpenAI } from "langchain/chat_models/openai";

export const runtime = "edge";

const formatMessage = (message: Message) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are a helpful assistant. Your task is to answer questions related to the context provided to you. Please STRICTLY ADHERE to answering questions related to the content only and if a question is unrelated then refrain from giving an answer even if you know the answer. KEEP IN MIND.
 
Current conversation:
{chat_history}
 
User: {input}
AI:`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.8,
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const outputParser = new BytesOutputParser();

    const chain = prompt.pipe(model).pipe(outputParser);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log(error);
    return "Error while generating response from Open AI.";
  }
}
