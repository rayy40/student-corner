import { auth } from "@/auth";
import { ConvexClientProvider } from "@/providers/convex-provider";

export default async function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <ConvexClientProvider session={session}>
      <div className="flex flex-col font-sans mx-auto h-screen items-center justify-center p-4">
        {children}
      </div>
    </ConvexClientProvider>
  );
}
