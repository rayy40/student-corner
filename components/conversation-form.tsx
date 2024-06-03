"use client";

import { ChatRequestOptions } from "ai";
import { ReactNode } from "react";
import { LuArrowUp } from "react-icons/lu";

type Props = {
  children: ReactNode;
  isLoading: boolean;
  input: string;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined
  ) => void;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

const ConversationForm = ({
  isLoading,
  input,
  handleSubmit,
  handleInputChange,
  children,
}: Props) => {
  return (
    <>
      {children}
      <div className="sticky bottom-0 bg-white p-4 w-full">
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="flex w-full gap-4 p-2 border bg-input rounded-2xl border-border shadow-input">
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
              disabled={isLoading}
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

export default ConversationForm;
