"use client";

import { useConvexAuth } from "convex/react";
import React from "react";

import ChatBot from "@/components/ChatBot";
import CodeViewer from "@/components/CodeViewer";
import LoadingSpinner from "@/components/LoadingSpinner";
import PDFViewer from "@/components/PDFViewer";
import UnAuthenticated from "@/components/UnAuthenticated";
import VideoViewer from "@/components/VideoViewer";
import { Id } from "@/convex/_generated/dataModel";
import { useQueryChatDetailsProps } from "@/hooks/useQueryObject";
import Link from "next/link";

const ChatId = ({ params }: { params: { chatId: string } }) => {
  const chatId = params.chatId as Id<"chatbook">;
  const { isLoading, isAuthenticated } = useConvexAuth();
  const chat = useQueryChatDetailsProps({ chatId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <UnAuthenticated />;
  }

  if (chat.loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (chat.data?.status === "failed") {
    return (
      <div className="flex flex-col font-sans gap-1 text-lg items-center justify-center w-full h-screen">
        {chat.data.error}
        <p className="underline text-secondary-foreground hover:text-foreground cursor-pointer underline-offset-2">
          <Link href={"/chat"}>Retry again.</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] mt-14 font-sans flex flex-col lg:flex-row">
      {chat?.data?.type === "documentation" ? (
        <div className="w-full flex flex-col justify-between h-full mx-auto max-w-[1140px]">
          <ChatBot
            dupChatId={chat?.data?.dupChatId}
            chatId={chat?.data?._id!}
            title={chat?.data?.title!}
            type={chat?.data?.type!}
          />
        </div>
      ) : (
        <>
          <div className="h-full w-full lg:w-[60%] border-r border-r-border">
            {chat?.data?.type === "codebase" && (
              <CodeViewer url={chat?.data?.url} chatId={chat?.data?._id} />
            )}
            {chat?.data?.type === "youtube" && (
              <VideoViewer url={chat?.data?.url} />
            )}
            {chat?.data?.type === "files" && (
              <PDFViewer url={chat?.data?.url!} />
            )}
          </div>
          <div className="flex w-full lg:w-[40%] justify-between flex-col h-full lg:min-w-[450px]">
            <ChatBot
              dupChatId={chat?.data?.dupChatId}
              chatId={chat?.data?._id!}
              title={chat?.data?.title!}
              type={chat?.data?.type!}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatId;
