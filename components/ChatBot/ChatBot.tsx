"use client";

import { Message } from "ai";
import { useChat } from "ai/react";
import { useConvex, useMutation } from "convex/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LuArrowUp } from "react-icons/lu";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formattedMessage } from "@/helpers/utils";
import { MessageData } from "@/types";

import MessageList from "../MessageList/MessageList";

const ChatBot = ({ chatId }: { chatId: Id<"chat"> }) => {
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const patchMessages = useMutation(api.chatbook.patchMessages);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const convex = useConvex();

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    onFinish: async () => {
      console.log(messages);
      await patchMessages({
        chatId: chatId,
        message: formattedMessage({ messages, formatTo: "timestamp" }),
      });
    },
  });

  const fetchMessageHistory = useCallback(async () => {
    try {
      const response: MessageData[] | string = await convex.query(
        api.chatbook.getMessageHistory,
        {
          chatId: chatId,
        }
      );
      if (Array.isArray(response)) {
        const message = formattedMessage({
          messages: response,
          formatTo: "Date",
        });
        setMessageHistory(message);
      }
    } catch (error) {
      console.log("Error fetching message history: ", error);
    }
  }, [chatId, convex]);

  useEffect(() => {
    fetchMessageHistory();
  }, [fetchMessageHistory]);

  const allMessages: Message[] = useMemo(
    () => [...messageHistory, ...messages],
    [messageHistory, messages]
  );

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef?.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, allMessages]);

  return (
    <>
      <div className="w-full sticky top-0 h-min mt-[0.75rem] p-4 items-center border-b border-b-border shadow-light">
        <h2 className="text-lg">Solar System</h2>
      </div>
      <div ref={messageListRef} className="h-full overflow-y-auto">
        <MessageList messages={allMessages} />
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
