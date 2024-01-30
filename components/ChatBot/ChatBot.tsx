"use client";

import { useChat } from "ai/react";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useRef } from "react";
import { LuArrowUp, LuTrash } from "react-icons/lu";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import MessageList from "../MessageList/MessageList";

const ChatBot = ({ chatId }: { chatId: Id<"chatbook"> }) => {
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const deleteHistory = useMutation(api.chatbook.deleteMessageHistory);

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
  });

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
          <h2 className="text-lg">Solar System</h2>
          <div>
            <LuTrash
              onClick={() => {
                deleteHistory({ chatId });
                setMessages([]);
              }}
              className="text-xl opacity-60 cursor-pointer hover:opacity-100"
            />
          </div>
        </div>
      </div>
      <div ref={messageListRef} className="h-full overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <div className="sticky bottom-0 p-4 w-full">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 w-full p-2 border bg-input rounded-2xl border-border shadow-input">
            <input
              autoComplete="off"
              type="text"
              id="chatbot"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question."
              className=" text-secondary-foreground w-full py-3 h-full text-lg bg-transparent ml-2 focus:outline-none "
            />
            <button
              className="p-2 text-xl flex items-center justify-center w-[50px] border border-border bg-muted-hover rounded-xl hover:opacity-80"
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
