import { QuizGameQuestionProps } from "@/lib/types";
import Link from "next/link";
import { SubmitButton } from "./button";
import { Id } from "@/convex/_generated/dataModel";

type ResultProps = {
  score?: number;
  numberOfQuestions?: number;
  questions?: QuizGameQuestionProps[];
  id: Id<"quiz">;
};

export const Result = ({
  score = 0,
  numberOfQuestions = 5,
  questions = [],
  id,
}: ResultProps) => {
  return (
    <div className="relative flex flex-col w-full gap-6 pt-20 mb-auto font-sans">
      <div className="pb-8 border-b border-b-border">
        <h2 className="gap-3 text-3xl font-medium text-foreground">
          You scored {score}/{numberOfQuestions}
        </h2>
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
              {questions?.map((q, id) => (
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
      <div className="fixed bottom-10 right-10">
        <Link href={`/quiz/${id}`}>
          <SubmitButton>Try Again</SubmitButton>
        </Link>
      </div>
    </div>
  );
};
