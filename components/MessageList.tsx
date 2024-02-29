import Markdown from "markdown-to-jsx";
import React, { memo } from "react";

import { initialAssistantMessage } from "@/helpers/format";
import { MessageType } from "@/types";

import { ListItem, OrderedList, UnorderedList } from "./Markdown/List";
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
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  type: "codebase" | "youtube" | "files" | "documentation";
  chatId: Id<"chatbook">;
  messages: MessageType[];
  isLoading: boolean;
  isStreamingStarted: boolean;
  error: string;
};

const MessageList = memo(
  ({ messages, isLoading, isStreamingStarted, type, error }: Props) => {
    const markDownToJsxOptions = {
      forceWrapper: true,
      wrapper: ({ children }: { children: JSX.Element[] }) => (
        <Wrapper>{children}</Wrapper>
      ),
      overrides: {
        pre: PreBlock,
        table: Table,
        p: Paragraph,
        ul: UnorderedList,
        ol: OrderedList,
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

    if (!messages) return;
    return (
      <div className="chat-bot py-3 px-5">
        <div className="bg-input text-foreground p-3 mb-2 pr-4 overflow-x-auto border border-border rounded-lg shadow-input max-w-[600px]">
          {initialAssistantMessage(type)}
        </div>
        {messages?.map((message: MessageType, index: number) => (
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
                {message.content.replaceAll(/```/g, "\n```")}
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
        {error && (
          <div className="bg-error mx-auto mt-3 text-center text-primary-foreground font-semibold p-3 rounded-lg shadow-light max-w-[600px]">
            {error}
          </div>
        )}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
