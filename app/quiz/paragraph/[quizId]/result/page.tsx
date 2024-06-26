import Loading from "@/app/loading";
import { auth } from "@/auth";
import { Result } from "@/components/ui/result";
import { UnAuthenticated } from "@/components/un-authenticated";
import { Id } from "@/convex/_generated/dataModel";
import { getQuiz } from "@/db/quiz";

const Page = async ({ params }: { params: { quizId: string } }) => {
  const quizId = params.quizId as Id<"quiz">;
  const session = await auth();

  if (!session?.user?.id) {
    return <UnAuthenticated />;
  }

  const { loading, success, error } = await getQuiz(quizId);

  if (loading) {
    return <Loading />;
  }

  if (error || success?.error) {
    throw new Error(error || success?.error);
  }

  return (
    <Result
      score={success?.score}
      numberOfQuestions={success?.numberOfQuestions}
      questions={success?.response?.questions}
      id={quizId}
    />
  );
};

export default Page;
