"use client";

import { useChat } from "ai/react";
import { useState } from "react";

import { Id } from "@/convex/_generated/dataModel";
import { patchMessages } from "@/db/chat";
import { ChatMessageWithDate, ChatSchemaSelection } from "@/lib/types";

import ConversationForm from "../conversation-form";
import { Messages } from "./messages";

type Props = {
  chatId: Id<"chatbook">;
  type: ChatSchemaSelection;
  formattedMessages?: ChatMessageWithDate[];
};

export const ChatBot = ({ chatId, type, formattedMessages }: Props) => {
  const [hasStreamingStarted, setHasStreamingStarted] = useState(false);

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
    body: {
      chatId,
      type,
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
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
      <ConversationForm
        input={input}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
      >
        <Messages
          isLoading={isLoading}
          error={error}
          messages={messages}
          hasStreamingStarted={hasStreamingStarted}
        />
      </ConversationForm>
    </div>
  );
};
