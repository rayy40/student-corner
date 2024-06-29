import { preloadedQueryResult } from "convex/nextjs";

import { auth } from "@/auth";
import { UnAuthenticated } from "@/components/un-authenticated";
import { Id } from "@/convex/_generated/dataModel";
import { getMessages, getPreloadedChat } from "@/db/chat";
import { ContentProvider } from "@/providers/content-provider";
import { ChatBotWrapper } from "@/components/chat-bot/chat-bot-wrapper";

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
  const initialMessages = await getMessages({ chatId });

  const chat = preloadedQueryResult(preloadedChat);

  if (chat.error) {
    throw new Error(chat.error);
  }

  return (
    <ContentProvider preloadedChat={preloadedChat} type="documentation">
      <ChatBotWrapper
        type="documentation"
        chatId={chatId}
        initialMessages={initialMessages}
        title={chat?.success?.title ?? "Untitled"}
      />
    </ContentProvider>
  );
};

export default Page;
