"use client";

import { useChat } from "ai/react";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import { LuArrowUp, LuTrash } from "react-icons/lu";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import MessageList from "../MessageList/MessageList";

type Props = {
  chatId: Id<"chatbook">;
  title: string;
};

const ChatBot = ({ chatId, title }: Props) => {
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const deleteHistory = useMutation(api.chatbook.deleteMessageHistory);
  const [isStreamingStarted, setIsStreamingStarted] = useState(false);

  const initalMessage = useQuery(
    api.chatbook.getMessageHistory,
    chatId !== null ? { chatId } : "skip"
  );

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
    },
    initialMessages: initalMessage
      ? Array.isArray(initalMessage)
        ? initalMessage
        : []
      : [],
    onResponse: () => {
      setIsStreamingStarted(true);
    },
    onFinish: () => {
      setIsStreamingStarted(false);
    },
  });

  console.log(isStreamingStarted);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef?.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <>
      <div className="w-full sticky top-0 h-min mt-[0.75rem] p-4 items-center border-b border-b-border shadow-light">
        <div className="flex justify-between items-center">
          <h2 className="min-w-[300px] max-w-[80%] whitespace-nowrap overflow-hidden overflow-ellipsis">
            {title}
          </h2>
          <div>
            <LuTrash
              onClick={() => {
                deleteHistory({ chatId });
                setMessages([]);
              }}
              className="text-lg opacity-60 cursor-pointer hover:opacity-100"
            />
          </div>
        </div>
      </div>
      <div ref={messageListRef} className="h-full overflow-y-auto">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isStreamingStarted={isStreamingStarted}
        />
      </div>
      <div className="sticky bottom-0 p-4 w-full">
        <form onSubmit={handleSubmit}>
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
