import React from "react";
import { Message } from "ai/react";

type Props = {
  messages: Message[];
};

const MessageList = ({ messages }: Props) => {
  if (!messages) return;
  console.log(messages);
  return (
    <div className="py-3 px-5">
      {messages.map((message: any) => (
        <div
          key={message?.id}
          className={`${
            message.role === "user" ? "justify-end" : "justify-start"
          } flex py-2`}
        >
          <div
            className={`${
              message.role === "user" ? "bg-secondary" : "bg-input"
            } p-3 rounded-lg shadow-input border border-border max-w-[600px]`}
          >
            <p>{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
