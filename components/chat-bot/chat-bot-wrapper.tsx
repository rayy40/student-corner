import { Id } from "@/convex/_generated/dataModel";
import { ChatMessage, ChatSchemaSelection } from "@/lib/types";
import { cn } from "@/lib/utils";

import DeleteConversation from "./delete-conversation";
import { ChatBot } from "./chat-bot";
import { ChatTitle } from "./chat-title";

type Props = {
  title: string;
  chatId: Id<"chatbook">;
  type: ChatSchemaSelection;
  initialMessages?: ChatMessage[] | null;
};

export const ChatBotWrapper = ({
  type,
  title,
  chatId,
  initialMessages,
}: Props) => {
  const formattedMessages = initialMessages?.map((message) => ({
    ...message,
    createdAt: new Date(message.createdAt),
  }));

  return (
    <div
      className={cn(
        "flex w-full mt-16 lg:w-[40%] justify-between flex-col h-[calc(100vh-4rem)] lg:min-w-[450px]"
      )}
    >
      <div className="w-full p-4 flex items-center justify-between border-b border-b-border bg-white shadow-light">
        <h2 className="min-w-[300px] max-w-[80%] whitespace-nowrap overflow-hidden overflow-ellipsis">
          <ChatTitle title={title} />
        </h2>
        <DeleteConversation chatId={chatId} />
      </div>
      <ChatBot
        type={type}
        chatId={chatId}
        formattedMessages={formattedMessages}
      />
    </div>
  );
};
