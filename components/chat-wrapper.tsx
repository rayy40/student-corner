"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import React from "react";

import Loading from "@/app/loading";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatMessage, ChatSchemaSelection } from "@/lib/types";

import ChatBot from "./chat-bot";
import { cn } from "@/lib/utils";
import VideoViewer from "./video-viewer";
import PDFViewer from "./pdf-viewer";
import CodeViewer from "./code-viewer";
import { useSearchParams } from "next/navigation";

type Props = {
  type: ChatSchemaSelection;
  chatId: Id<"chatbook">;
  initialMessages: ChatMessage[] | null;
  preloadedChat: Preloaded<typeof api.chatbook.chat.getChat>;
};

export const ChatWrapper = ({
  type,
  preloadedChat,
  chatId,
  initialMessages,
}: Props) => {
  const searchParams = useSearchParams();
  const isSidebarOpen = searchParams.get("sidebar") || "false";
  const selectedFileIndex = searchParams.get("index");

  const { success, loading, error } = usePreloadedQuery(preloadedChat);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    throw new Error(error);
  }

  const renderContent = (type: ChatSchemaSelection) => {
    switch (type) {
      case "youtube":
        return <VideoViewer url={success?.url} />;
      case "files":
        return <PDFViewer url={success?.url} />;
      case "github":
        return (
          <CodeViewer
            selectedFileIndex={parseInt(selectedFileIndex || "0")}
            isSidebarOpen={isSidebarOpen}
            url={success?.url}
            chatId={chatId}
          />
        );
      default:
        return;
    }
  };

  return (
    <>
      {type !== "documentation" && (
        <div className="w-full h-full lg:w-[60%] border-r border-r-border">
          {renderContent(type)}
        </div>
      )}
      <ChatBot
        className={cn({
          "lg:w-full max-w-[1000px]": type === "documentation",
        })}
        chatId={chatId}
        initialMessages={initialMessages}
        title={success?.title}
      />
    </>
  );
};
