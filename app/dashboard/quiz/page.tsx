"use client";

import { useQuery } from "convex/react";
import React from "react";

import DashboardCard from "@/components/DashboardCard/DashboardCard";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserIdStore } from "@/providers/store";

const QuizDashboard = () => {
  const { userId } = useUserIdStore();
  const quizHistory = useQuery(api.quiz.getQuizHistory, {
    userId: userId as Id<"users">,
  });

  console.log(quizHistory);
  return (
    <div className="p-4 mt-16 font-sans ">
      <div className="flex items-center justify-between py-4 border-b border-b-border">
        <h1 className="text-2xl">Dashboard</h1>
        {/* <form className="border border-border" action="/">
          <input type="search" value={"Enter search..."} />
        </form> */}
      </div>
      <div className="py-6 grid gap-6 grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))]">
        {quizHistory?.map((quiz) => (
          <DashboardCard
            key={quiz?._id}
            topic={quiz?.content}
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
