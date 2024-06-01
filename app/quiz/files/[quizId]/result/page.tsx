import Loading from "@/app/loading";
import { Result } from "@/components/ui/result";
import { Id } from "@/convex/_generated/dataModel";
import { getQuiz } from "@/db/quiz";

const Page = async ({ params }: { params: { quizId: string } }) => {
  const { loading, success, error } = await getQuiz(
    params.quizId as Id<"quiz">
  );

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
    />
  );
};

export default Page;
