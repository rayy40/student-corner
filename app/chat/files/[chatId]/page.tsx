import { preloadedQueryResult } from "convex/nextjs";

import { auth } from "@/auth";
import ChatBot from "@/components/chat-bot";
import PDFViewer from "@/components/pdf-viewer";
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
    <>
      <div className="w-full h-full lg:w-[60%] border-r border-r-border">
        <PDFViewer url={chat?.success?.url} />
      </div>
      <ChatBot
        chatId={chatId}
        initialMessages={initialMessages}
        preloadedChat={preloadedChat}
      />
    </>
  );
};

export default Page;
