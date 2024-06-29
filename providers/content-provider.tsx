// content-context.tsx
"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import React, { createContext, ReactNode, useContext } from "react";

import Loading from "@/app/loading";
import { PDFViewer } from "@/components/pdf-viewer";
import { VideoViewer } from "@/components/video-viewer";
import { api } from "@/convex/_generated/api";
import { ChatSchemaSelection } from "@/lib/types";
import { CodeViewer } from "@/components/chat-bot/code-viewer";

type ContentContextType = {
  url?: string;
  title?: string;
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({
  type,
  children,
  preloadedChat,
}: {
  children: ReactNode;
  type: ChatSchemaSelection;
  preloadedChat: Preloaded<typeof api.chatbook.chat.getChat>;
}) => {
  const { success, loading, error } = usePreloadedQuery(preloadedChat);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    throw new Error(error);
  }

  const renderContent = (type: ChatSchemaSelection) => {
    if (!success?.url) return <div>No content found.</div>;

    switch (type) {
      case "files":
        return <PDFViewer url={success?.url} />;
      case "youtube":
        return <VideoViewer url={success?.url} />;
      default:
        return;
    }
  };

  return (
    <ContentContext.Provider
      value={{ title: success?.title, url: success?.url }}
    >
      {["files", "youtube"].includes(type) && (
        <div className="hidden h-full overflow-auto lg:block w-full lg:w-[60%] border-r border-r-border">
          {renderContent(type)}
        </div>
      )}
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
