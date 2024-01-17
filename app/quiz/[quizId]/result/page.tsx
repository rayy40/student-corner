"use client";

import Link from "next/link";
import React from "react";
import { LuTrophy } from "react-icons/lu";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";

const Result = ({ params }: { params: { quizId: string } }) => {
  console.log(params.quizId);

  const quizData = useQuery(api.quiz.getQuizData, {
    quizId: params.quizId,
  });

  console.log(quizData);

  if (!quizData) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (quizData?.err) {
    return (
      <div className="flex items-center justify-center w-full h-full text-lg">
        <p>No Quiz Id found.</p>
      </div>
    );
  }

  if (quizData?.quiz && !quizData?.quiz?.response) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quizData?.quiz) {
    return (
      <div className="flex items-center justify-center w-full h-full text-lg">
        <p>{quizData?.fallback}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-6 p-4 py-20">
      <div className="flex flex-col items-center justify-center w-full gap-6 py-10 border rounded-md border-border shadow-light">
        <LuTrophy className="text-[4rem]" />
        <div className="flex flex-col items-center justify-center gap-1 text-lg">
          <p>You got 2 out of 4</p>
          <p>Score - 40</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full gap-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-medium">Summary</h2>
          <Link
            href={"/dashboard/quiz"}
            className="underline text-md text-tertiary-foreground underline-offset-2 hover:no-underline"
          >
            History
          </Link>
        </div>
        <div className="w-full py-2 border-t border-t-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="font-medium text-tertiary-foreground">
                <td className="border-b-border border-b p-2 w-[5%]">No.</td>
                <td className="border-b-border border-b p-2 mx-4 w-[50%]">
                  Questions
                </td>
                <td className="border-b-border border-b p-2 mx-4 w-[40%]">
                  Your Answer
                </td>
              </tr>
            </thead>
            <tbody>
              {quizData?.quiz?.response ? (
                Array.isArray(quizData?.quiz?.response) ? (
                  quizData?.quiz?.response?.map((q, id) => (
                    <tr key={id}>
                      <td className="border-b-border border-b p-3 px-2 w-[5%]">
                        {id + 1}
                      </td>
                      <td className="border-b-border border-b p-3 px-2 pr-12 w-[50%]">
                        <p className="font-light">{q.question}</p>
                        <p className="font-medium">{q.answer}</p>
                      </td>
                      <td className="border-b-border border-b p-3 px-2 w-[40%] font-medium">
                        {q.yourAnswer}
                      </td>
                    </tr>
                  ))
                ) : (
                  <p>{quizData?.quiz?.response}</p>
                )
              ) : (
                <p>Unavailable</p>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Result;
