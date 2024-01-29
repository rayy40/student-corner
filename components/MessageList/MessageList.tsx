import { Message } from "ai/react";
import React from "react";
import Markdown from "markdown-to-jsx";

type Props = {
  messages: Message[];
};

const MessageList = ({ messages }: Props) => {
  if (!messages) return;

  const FormattedText = ({ text }: { text: string }) => {
    return (
      <Markdown className="markdown-wrapper flex flex-col gap-6">
        {text}
      </Markdown>
    );
  };

  return (
    <div className="py-3 px-5">
      {messages.map((message: Message, index: number) => (
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
    </div>
  );
};

export default MessageList;
