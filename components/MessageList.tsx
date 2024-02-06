import Markdown from "markdown-to-jsx";
import React from "react";

import { MessageType } from "@/types";

import { List, ListItem } from "./Markdown/List";
import Paragraph from "./Markdown/Paragraph";
import PreBlock from "./Markdown/PreBlock";
import Table from "./Markdown/Table";
import {
  Header,
  PrimaryHeader,
  SecondaryHeader,
  Strong,
  TertiaryHeader,
} from "./Markdown/Tags";
import Wrapper from "./Markdown/Wrapper";

type Props = {
  messages: MessageType[];
  isLoading: boolean;
  isStreamingStarted: boolean;
};

const MessageList = ({ messages, isLoading, isStreamingStarted }: Props) => {
  if (!messages) return;

  const markDownToJsxOptions = {
    forceWrapper: true,
    wrapper: ({ children }: { children: JSX.Element[] }) => {
      if (children?.[0]?.type?.name !== "Table") {
        return <Wrapper>{children}</Wrapper>;
      } else {
        return children;
      }
    },
    overrides: {
      pre: PreBlock,
      table: Table,
      p: Paragraph,
      ul: List,
      ol: List,
      li: ListItem,
      strong: Strong,
      h1: PrimaryHeader,
      h2: SecondaryHeader,
      h3: TertiaryHeader,
      h4: Header,
      h5: Header,
      h6: Header,
    },
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
              message.role === "user"
                ? "bg-secondary"
                : "bg-input text-foreground"
            } overflow-x-auto border border-border rounded-lg shadow-input max-w-[600px]`}
          >
            <Markdown options={markDownToJsxOptions}>
              {message.content}
            </Markdown>
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
