import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import React from "react";

interface Props {
  topic: string;
  score: number;
  questions: number;
  quizId: Id<"quiz">;
}

const DashboardCard = ({ topic, questions, quizId, score }: Props) => {
  return (
    <div className="flex flex-col items-start border rounded-lg border-border shadow-medium">
      <div className="max-w-[250px] font-dmSans rounded-t-md p-5 text-2xl">
        {topic}
      </div>
      <div className="flex items-center gap-2 px-5 pb-5 text-lg divide-x text-muted-foreground">
        <p> {questions} Questions </p>
        <p className="pl-2"> Score - {score} </p>
      </div>
      <div className="flex items-center w-full gap-4 p-5 bg-border text-secondary-foreground">
        <Link
          className="w-1/2 p-4 px-2 text-center transition-colors border rounded-lg border-muted hover:bg-secondary-hover"
          href={`/quiz/${quizId}`}
        >
          <button>Take Quiz Again</button>
        </Link>
        <Link
          className="w-1/2 p-4 px-2 text-center transition-colors border rounded-lg border-muted hover:bg-secondary-hover"
          href={`/quiz/${quizId}/result`}
        >
          <button>Show Statistics</button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardCard;
