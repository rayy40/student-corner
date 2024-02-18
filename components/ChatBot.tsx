"use client";

import { useChat } from "ai/react";
import { useMutation } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import { LuArrowUp, LuTrash } from "react-icons/lu";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import MessageList from "./MessageList";
import { useConversationHistory } from "@/hooks/useQueryObject";
import { MessageData } from "@/types";

type Props = {
  chatId: Id<"chatbook">;
  conversationId: Id<"conversations"> | undefined;
  title: string;
  type: "code" | "video" | "doc";
};

const ChatBot = ({ chatId, title, type, conversationId }: Props) => {
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const deleteHistory = useMutation(api.conversations.deleteConversation);
  const [isStreamingStarted, setIsStreamingStarted] = useState(false);
  const [error, setError] = useState("");
  const messageHistory: MessageData[] = useConversationHistory(chatId);

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    setMessages,
    isLoading,
  } = useChat({
    api: "/api/chat",
    body: {
      chatId,
      type,
    },
    initialMessages: messageHistory,
    onResponse: () => {
      setError("");
      setIsStreamingStarted(true);
    },
    onFinish: () => {
      setIsStreamingStarted(false);
    },
    onError(error) {
      console.error(error);
      setError("Unable to get response from OpenAI. Please try again.");
      setIsStreamingStarted(false);
    },
  });

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current?.scrollTo({
        top: messageListRef?.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <>
      <div className="w-full sticky top-0 h-min mt-[0.75rem] p-4 items-center border-b border-b-border shadow-light">
        <div className="flex px-1 justify-between items-center">
          <h2 className="min-w-[300px] max-w-[80%] whitespace-nowrap overflow-hidden overflow-ellipsis">
            {title}
          </h2>
          {conversationId && (
            <div>
              <LuTrash
                onClick={() => {
                  deleteHistory({ conversationId });
                  setMessages([]);
                }}
                className="text-lg opacity-60 cursor-pointer hover:opacity-100"
              />
            </div>
          )}
        </div>
      </div>
      <div ref={messageListRef} className="h-full overflow-y-auto">
        <MessageList
          type={type}
          chatId={chatId}
          messages={messages}
          isLoading={isLoading}
          error={error}
          isStreamingStarted={isStreamingStarted}
        />
      </div>
      <div className="sticky bottom-0 p-4 w-full">
        <form
          onSubmit={() => {
            handleSubmit;
            setError("");
          }}
        >
          <div className="flex gap-4 w-full p-2 border bg-input rounded-2xl border-border shadow-input">
            <input
              disabled={isLoading}
              autoComplete="off"
              type="text"
              id="chatbot"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question."
              className=" disabled:opacity-50 text-secondary-foreground w-full py-3 h-full text-[1.125rem] bg-transparent ml-2 focus:outline-none "
            />
            <button
              className=" disabled:opacity-50 p-2 text-xl flex items-center justify-center w-[50px] border border-border bg-muted-hover rounded-xl hover:opacity-80"
              type="submit"
            >
              <LuArrowUp />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
