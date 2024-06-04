import { LuTimer } from "react-icons/lu";

import { QuizGameForm } from "@/components/quiz-game-form";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@/auth";
import { preloadedQueryResult } from "convex/nextjs";
import { getPreloadedQuiz } from "@/db/quiz";
import { UnAuthenticated } from "@/components/un-authenticated";

const QuizIdPage = async ({ params }: { params: { quizId: Id<"quiz"> } }) => {
  const session = await auth();

  if (!session?.user?.id) {
    return <UnAuthenticated />;
  }

  const preloadedQuiz = await getPreloadedQuiz(params.quizId);
  const quiz = preloadedQueryResult(preloadedQuiz);

  if (quiz.error || quiz.success?.error) {
    throw new Error(quiz.error || quiz.success?.error);
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center justify-between w-full pb-4 border-b border-b-border">
        <div className="flex items-center gap-2 text-lg">
          <span className="font-medium text-muted-foreground">Topic: </span>
          <p>{quiz.success?.response?.title}</p>
        </div>
        <div className="flex gap-0.5 font-semibold item-center text-muted-foreground">
          {/* Add Timer Logic */}
          <LuTimer /> <span>00:00</span>
        </div>
      </div>
      <QuizGameForm
        type="files"
        format={quiz.success?.format}
        userId={session.user.id}
        quizId={params.quizId}
        preloadedQuestions={preloadedQuiz}
      />
    </div>
  );
};

export default QuizIdPage;
