import { preloadedQueryResult } from "convex/nextjs";

import { auth } from "@/auth";
import ChatBot from "@/components/chat-bot";
import { UnAuthenticated } from "@/components/un-authenticated";
import VideoViewer from "@/components/video-viewer";
import { Id } from "@/convex/_generated/dataModel";
import { getPreloadedChat, getPreloadedMessages } from "@/db/chat";

type Props = {
  params: { chatId: string };
};

const Page = async ({ params }: Props) => {
  const session = await auth();

  if (!session?.user?.id) {
    return <UnAuthenticated />;
  }

  const chatId = params.chatId as Id<"chatbook">;

  const preloadedChat = await getPreloadedChat(chatId);
  const preloadedInitialMessages = await getPreloadedMessages(chatId);

  const chat = preloadedQueryResult(preloadedChat);
  const messages = preloadedQueryResult(preloadedInitialMessages);

  if (chat.error) {
    throw new Error(chat.error);
  }

  return (
    <>
      <div className="w-full h-full lg:w-[60%] border-r border-r-border">
        <VideoViewer url={chat.success?.url} />
      </div>
      <ChatBot
        chatId={chatId}
        initialMessages={messages}
        preloadedChat={preloadedChat}
      />
    </>
  );
};

export default Page;
