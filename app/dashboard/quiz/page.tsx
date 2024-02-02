"use client";

import React from "react";

import DashboardList from "@/components/DashboardList/DashboardList";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { useQueryQuizHistoryProps } from "@/hooks/useQueryObject";
import { useUserIdStore } from "@/providers/store";

const QuizDashboard = () => {
  const { userId } = useUserIdStore();
  const quizHistory = useQueryQuizHistoryProps({ userId: userId! });

  if (quizHistory.loading) {
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
        <DashboardList data={quizHistory?.data!} type="quiz" />
      </div>
    </div>
  );
};

export default QuizDashboard;
