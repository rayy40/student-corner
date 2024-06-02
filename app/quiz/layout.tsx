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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 mx-auto font-sans lg:h-screen">
        {children}
      </div>
    </ConvexClientProvider>
  );
}
