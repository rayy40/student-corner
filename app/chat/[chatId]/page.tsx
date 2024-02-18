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
import { useQueryEmbeddingProps } from "@/hooks/useQueryObject";

const ChatId = ({ params }: { params: { chatId: string } }) => {
  const chatId = params.chatId as Id<"chatbook">;
  const { isLoading, isAuthenticated } = useConvexAuth();
  const chat = useQueryEmbeddingProps({ chatId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoading && !isAuthenticated) {
    return <UnAuthenticated />;
  }

  if (chat.loading || chat.data === undefined) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (chat.data === null) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <p>No database found for this Id.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] mt-14 font-sans flex">
      <div className="h-full w-[60%] border-r border-r-border">
        {chat?.data?.type === "code" && (
          <CodeViewer url={chat?.data?.url} chatId={chat?.data?._id} />
        )}
        {chat?.data?.type === "video" && <VideoViewer url={chat?.data?.url} />}
        {chat?.data?.type === "doc" && <PDFViewer url={chat?.data?.url!} />}
      </div>
      <div className="flex w-[40%] justify-between flex-col h-full min-w-[450px]">
        <ChatBot
          chatId={chat?.data?._id!}
          title={chat?.data?.title!}
          conversationId={undefined}
          type={chat?.data?.type ?? "doc"}
        />
      </div>
    </div>
  );
};

export default ChatId;
