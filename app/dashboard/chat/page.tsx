import { auth } from "@/auth";
import DashboardList from "@/components/DashboardList";
import { Id } from "@/convex/_generated/dataModel";
import { getChatHistory } from "@/db/chat";

const Page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    //TODO: handle unauthenticated

    return;
  }

  const userId = session.user.id as Id<"users">;

  const chats = await getChatHistory(userId);

  return (
    <div className="p-4 mt-16 font-sans ">
      <div className="flex items-center justify-between py-4 border-b border-b-border">
        <h1 className="text-2xl">Dashboard</h1>
        {/* <form className="border border-border" action="/">
          <input type="search" value={"Enter search..."} />
        </InputForm> */}
      </div>
      <div className="w-full py-4">
        <DashboardList data={chats} type="chat" />
      </div>
    </div>
  );
};

export default Page;
