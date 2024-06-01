import { preloadedQueryResult } from "convex/nextjs";

import ChatBot from "@/components/chat-bot";
import { Id } from "@/convex/_generated/dataModel";
import { getPreloadedChat, getPreloadedMessages } from "@/db/chat";

type Props = {
  params: { chatId: string };
};

const Page = async ({ params }: Props) => {
  const chatId = params.chatId as Id<"chatbook">;

  const preloadedChat = await getPreloadedChat(chatId);
  const preloadedInitialMessages = await getPreloadedMessages(chatId);

  const messages = preloadedQueryResult(preloadedInitialMessages);

  return (
    <ChatBot
      className="lg:w-full max-w-[1000px]"
      chatId={chatId}
      initialMessages={messages}
      preloadedChat={preloadedChat}
    />
  );
};

export default Page;
