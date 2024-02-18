"use client";

import { useConvexAuth } from "convex/react";
import Link from "next/link";
import React from "react";
import { LuTrophy } from "react-icons/lu";

import LoadingSpinner from "@/components/LoadingSpinner";
import UnAuthenticated from "@/components/UnAuthenticated";
import { Id } from "@/convex/_generated/dataModel";
import { useQueryQuizProps } from "@/hooks/useQueryObject";

const Result = ({ params }: { params: { quizId: string } }) => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const game = useQueryQuizProps({ quizId: params.quizId as Id<"quiz"> });

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

  if (game.loading || game.quiz === undefined) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (game.quiz === null) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <p>Result cannot be calculated for an invalid Quiz Id.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-6 p-4 py-20 font-sans">
      <div className="flex flex-col items-center justify-center w-full gap-6 py-10 border rounded-md border-border shadow-light">
        <LuTrophy className="text-[4rem]" />
        <div className="flex flex-col items-center justify-center gap-1 text-lg">
          <p>
            You got {game?.quiz?.result?.correctAnswer} out of{" "}
            {game?.quiz?.questionNumber}
          </p>
          <p>Score - {game?.quiz?.result?.score}</p>
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
              <tr className="text-tertiary-foreground">
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
              {game?.quiz?.response?.questions?.map((q, id) => (
                <tr key={id}>
                  <td className="border-b-border text-tertiary-foreground border-b p-3 px-2 w-[5%]">
                    {id + 1}
                  </td>
                  <td className="border-b-border border-b p-3 px-2 pr-12 w-[50%]">
                    <p className="text-foreground">{q.question}</p>
                    <p className="text-secondary-foreground">{q.answer}</p>
                  </td>
                  <td className="border-b-border border-b p-3 px-2 w-[40%] text-secondary-foreground">
                    {q.yourAnswer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Result;
