"use client";

import React from "react";

import DashboardList from "@/components/DashboardList/DashboardList";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { useQueryChatHistoryProps } from "@/hooks/useQueryObject";
import { useUserIdStore } from "@/providers/store";

const ChatDashboard = () => {
  const { userId } = useUserIdStore();
  const chatHistory = useQueryChatHistoryProps({ userId: userId! });

  if (chatHistory.loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 mt-16 font-sans ">
      <div className="flex items-center justify-between py-4 border-b border-b-border">
        <h1 className="text-2xl">Dashboard</h1>
        {/* <form className="border border-border" action="/">
          <input type="search" value={"Enter search..."} />
        </form> */}
      </div>
      <div className="w-full py-4">
        <DashboardList data={chatHistory?.data!} type="chat" />
      </div>
    </div>
  );
};

export default ChatDashboard;
