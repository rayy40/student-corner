import { Message } from "ai";
import Markdown from "markdown-to-jsx";
import { memo } from "react";
import { Wrapper } from "./Markdown/wrapper";

import overridenComponents from "./Markdown";
import { MessageWrapper } from "./ui/message-wrapper";
import { FormError } from "./ui/form-error";

type Props = {
  messages: Message[];
  isLoading: boolean;
  hasStreamingStarted: boolean;
  error?: Error;
};

export const Messages = memo(
  ({ messages, isLoading, hasStreamingStarted, error }: Props) => {
    const markDownToJsxOptions = {
      forceWrapper: true,
      wrapper: ({ children }: { children: JSX.Element[] }) => (
        <Wrapper>{children}</Wrapper>
      ),
      overrides: overridenComponents,
    };

    return (
      <div className="p-4 overflow-auto message-wrapper h-full flex flex-col-reverse ![overflow-anchor:none] w-full">
        <div className="space-y-4">
          <MessageWrapper>
            {/* Add assistant message */}
            <p>How can I help you today?</p>
          </MessageWrapper>
          {messages.map((message, index) => (
            <MessageWrapper role={message.role} key={index}>
              <Markdown options={markDownToJsxOptions}>
                {message.content.replaceAll(/```/g, "\n```")}
              </Markdown>
            </MessageWrapper>
          ))}
          {isLoading && !hasStreamingStarted && (
            <div className="flex flex-col gap-1 w-full max-w-[60ch] mb-4 animate-pulse">
              <div className="bg-input rounded-md shadow-input border border-border h-8 w-[90%]"></div>
              <div className="bg-input rounded-md shadow-input border border-border h-8 min-w-[200px] w-[60%]"></div>
            </div>
          )}
          {error && (
            <FormError
              className="w-full px-4 mb-5 rounded-lg"
              error={error.message}
            />
          )}
        </div>
      </div>
    );
  }
);

Messages.displayName = "Messages";
