import { auth } from "@/auth";
import { Dashboard } from "@/components/dashboard";
import { UnAuthenticated } from "@/components/un-authenticated";
import { Id } from "@/convex/_generated/dataModel";
import { getQuizHistory } from "@/db/quiz";

const Page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return <UnAuthenticated />;
  }

  const userId = session.user.id as Id<"users">;

  const quizHistory = await getQuizHistory(userId);

  return (
    <div className="p-4 mt-16 font-sans ">
      <div className="flex items-center justify-between py-4 border-b border-b-border">
        <h2 className="pb-2 text-3xl font-medium">Your Quizes</h2>
        {/* <form className="border border-border" action="/">
          <input type="search" value={"Enter search..."} />
        </InputForm> */}
      </div>
      <div className="w-full py-4">
        <Dashboard data={quizHistory} type="quiz" />
      </div>
    </div>
  );
};

export default Page;
