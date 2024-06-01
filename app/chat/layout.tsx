import { auth } from "@/auth";
import { ConvexClientProvider } from "@/providers/convex-provider";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <ConvexClientProvider session={session}>
      <div className="flex flex-col items-center justify-center h-screen mx-auto font-sans lg:flex-row">
        {children}
      </div>
    </ConvexClientProvider>
  );
}
