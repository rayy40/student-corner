"use client";

import ChatBot from "@/components/ChatBot/ChatBot";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import PDFViewer from "@/components/PDFViewer/PDFViewer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React from "react";

const ChatId = ({ params }: { params: { chatId: string } }) => {
  // const chat = useQuery(api.chatbook.getEmbeddingId, {
  //   chatId: params.chatId as Id<"chat">,
  // });

  // if (!chat) {
  //   return (
  //     <div className="flex items-center justify-center w-full h-full">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  // if (typeof chat == "string") {
  //   return (
  //     <div className="flex font-sans items-center justify-center w-full h-full text-lg">
  //       <p>{chat}</p>
  //     </div>
  //   );
  // }

  // console.log(chat);
  return (
    <div className="h-[calc(100vh-56px)] mt-14 font-sans flex">
      <div className="h-full flex-[6]">
        <PDFViewer
          url={
            "https://content-tortoise-560.convex.cloud/api/storage/9bd3d7f9-2b53-42b8-bc27-591c0ba3a5c0"
          }
        />
      </div>
      <div className="flex justify-between flex-col h-full flex-[4]">
        <ChatBot />
      </div>
    </div>
  );
};

// jh72009fsfb8b3dysczymq9sv56j4xfy

export default ChatId;
