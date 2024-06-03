"use client";

import { useChat } from "ai/react";
import { useState } from "react";

import { Id } from "@/convex/_generated/dataModel";
import { patchMessages } from "@/db/chat";
import { ChatMessage } from "@/lib/types";

import ConversationForm from "./conversation-form";
import DeleteConversation from "./delete-conversation";
import { Messages } from "./messages";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import Loading from "@/app/loading";

type Props = {
  className?: string;
  chatId: Id<"chatbook">;
  initialMessages?: ChatMessage[] | null;
  preloadedChat: Preloaded<typeof api.chatbook.chat.getChat>;
};

const ChatBot = ({
  className,
  chatId,
  initialMessages,
  preloadedChat,
}: Props) => {
  const {
    success,
    error: convexError,
    loading,
  } = usePreloadedQuery(preloadedChat);
  const [hasStreamingStarted, setHasStreamingStarted] = useState(false);
  const formattedMessages = initialMessages?.map((message) => ({
    ...message,
    createdAt: new Date(message.createdAt),
  }));

  const {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    messages,
    stop,
    reload,
  } = useChat({
    api: "/api/chat",
    // streamMode: "text",
    body: {
      chatId,
      type: "youtube",
    },
    initialMessages: formattedMessages,
    onResponse() {
      setHasStreamingStarted(true);
    },
    onError() {
      setHasStreamingStarted(false);
    },
    async onFinish(message) {
      if (error) return;
      await patchMessages({ chatId, userMessage: input, aiMessage: message });
      setHasStreamingStarted(false);
    },
  });

  if (loading) {
    // TODO: add loading
    return <Loading />;
  }

  if (convexError) {
    throw new Error(convexError);
  }

  return (
    <div
      className={cn(
        "flex w-full mt-16 lg:w-[40%] justify-between flex-col h-[calc(100vh-4rem)] lg:min-w-[450px]",
        className
      )}
    >
      <div className="w-full p-4 flex items-center justify-between border-b border-b-border bg-white shadow-light">
        <h2 className="min-w-[300px] max-w-[80%] whitespace-nowrap overflow-hidden overflow-ellipsis">
          {success?.title ?? "Untitled"}
        </h2>
        <DeleteConversation chatId={chatId} />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
        <ConversationForm
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        >
          <Messages
            messages={messages}
            hasStreamingStarted={hasStreamingStarted}
            isLoading={isLoading}
            error={error}
          />
        </ConversationForm>
      </div>
    </div>
  );
};

export default ChatBot;
