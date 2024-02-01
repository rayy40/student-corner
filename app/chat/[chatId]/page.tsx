"use client";

import React from "react";
import Youtube from "react-youtube";

import ChatBot from "@/components/ChatBot/ChatBot";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import PDFViewer from "@/components/PDFViewer/PDFViewer";
import { Id } from "@/convex/_generated/dataModel";
import { useQueryChatProps } from "@/hooks/useQueryObject";

const ChatId = ({ params }: { params: { chatId: string } }) => {
  const chat = useQueryChatProps({ chatId: params.chatId as Id<"chatbook"> });

  if (chat.loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] mt-14 font-sans flex">
      <div className="h-full flex-[6] border-r border-r-border">
        {/* <Youtube videoId="SSjdRXwqg_U" /> */}
        {/* <PDFViewer url={chat?.url} /> */}
      </div>
      <div className="flex justify-between flex-col h-full min-w-[450px] flex-[4]">
        <ChatBot chatId={chat?.data?._id!} title={chat?.data?.title!} />
      </div>
    </div>
  );
};

export default ChatId;
