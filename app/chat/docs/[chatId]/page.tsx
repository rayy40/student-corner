import { preloadedQueryResult } from "convex/nextjs";

import { auth } from "@/auth";
import { ChatWrapper } from "@/components/chat-wrapper";
import { UnAuthenticated } from "@/components/un-authenticated";
import { Id } from "@/convex/_generated/dataModel";
import { getMessages, getPreloadedChat } from "@/db/chat";

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
    <ChatWrapper
      preloadedChat={preloadedChat}
      chatId={chatId}
      initialMessages={initialMessages}
      type="documentation"
    />
  );
};

export default Page;
