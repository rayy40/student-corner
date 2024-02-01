"use client";

import React from "react";

import DashboardCard from "@/components/DashboardCard/DashboardCard";
import { useUserIdStore } from "@/providers/store";
import { useQueryQuizHistoryProps } from "@/hooks/useQueryObject";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";

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
      <div className="py-6 grid gap-6 grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))]">
        {quizHistory?.data?.map((quiz) => (
          <DashboardCard
            key={quiz?._id}
            topic={
              typeof quiz?.response === "object"
                ? quiz?.response?.title
                : "Quiz"
            }
            questions={quiz?.questionNumber}
            quizId={quiz?._id}
            score={quiz?.result?.score ?? 0}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizDashboard;
