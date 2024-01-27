import React from "react";
import MessageList from "../MessageList/MessageList";
import { LuArrowUp } from "react-icons/lu";
import { useChat } from "ai/react";

type Props = {};

const ChatBot = (props: Props) => {
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
  });

  console.log(messages);

  return (
    <>
      <div className="w-full sticky top-0 h-min mt-[0.75rem] p-4 items-center border-b border-b-border shadow-light">
        <h2 className="text-lg">Solar System</h2>
      </div>
      <div className="h-full overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <div className="sticky bottom-0 p-4 w-full">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 w-full p-2 border bg-input rounded-2xl border-border shadow-input">
            <input
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
