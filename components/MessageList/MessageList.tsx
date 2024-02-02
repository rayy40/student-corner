import React from "react";
import Markdown from "markdown-to-jsx";
import { MessageType } from "@/types";

type Props = {
  messages: MessageType[];
  isLoading: boolean;
  isStreamingStarted: boolean;
};

const MessageList = ({ messages, isLoading, isStreamingStarted }: Props) => {
  if (!messages) return;

  const FormattedText = ({ text }: { text: string }) => {
    return <Markdown className="markdown-wrapper">{text}</Markdown>;
  };

  return (
    <div className="chat-bot py-3 px-5">
      {messages.map((message: MessageType, index: number) => (
        <div
          key={index}
          className={`${
            message.role === "user" ? "justify-end" : "justify-start"
          } flex py-2`}
        >
          <div
            className={`${
              message.role === "user" ? "bg-secondary" : "bg-input"
            } p-3 rounded-lg shadow-input border border-border max-w-[600px]`}
          >
            <FormattedText text={message.content} />
          </div>
        </div>
      ))}
      {!isStreamingStarted && isLoading && (
        <div className="flex flex-col gap-1 w-full max-w-[500px] animate-pulse">
          <div className="bg-input rounded-md shadow-input border border-border h-8 w-[80%]"></div>
          <div className="bg-input rounded-md shadow-input border border-border h-8 min-w-[200px] w-[40%]"></div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
