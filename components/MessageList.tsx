import Markdown from "markdown-to-jsx";
import React, { memo, useMemo } from "react";

import { initialAssistantMessage } from "@/helpers/format";
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
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  type: "code" | "video" | "doc";
  chatId: Id<"chatbook">;
  messages: MessageType[];
  isLoading: boolean;
  isStreamingStarted: boolean;
};

const MessageList = memo(
  ({ messages, isLoading, isStreamingStarted, type, chatId }: Props) => {
    const markDownToJsxOptions = {
      forceWrapper: true,
      wrapper: ({ children }: { children: JSX.Element[] }) => (
        <Wrapper>{children}</Wrapper>
      ),
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

    const getFormattedMessage = (content: string) => {
      const filePathIndex = content.indexOf("filePath:");

      const path = content
        .slice(filePathIndex + 10)
        .trim()
        .replace(/[\r\n`]+/gm, "");

      const contentWithoutPath = content
        .slice(0, filePathIndex)
        .trim()
        .replace(/^`[\s\n]*|`[\s\n]*$/g, "");
      const contentWithoutFinalDelimiters = contentWithoutPath
        .replaceAll(/```/g, "\n```")
        .replace(/```[a-zA-Z]+$/, "");

      return `${contentWithoutFinalDelimiters} **Source:** [${path}](${"https://www.ggogle.com"})`;
    };

    if (!messages) return;
    return (
      <div className="chat-bot py-3 px-5">
        <div className="bg-input text-foreground p-3 pr-4 overflow-x-auto border border-border rounded-lg shadow-input max-w-[600px]">
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
                {message.role === "assistant" &&
                message.content.indexOf("filePath") !== -1
                  ? getFormattedMessage(message.content)
                  : message.content.replaceAll(/```/g, "\n```")}
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
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
