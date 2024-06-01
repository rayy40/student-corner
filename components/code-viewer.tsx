import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight as CodeStyle } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Id } from "@/convex/_generated/dataModel";

import Sidebar from "./sidebar";
import { getPreloadedGithubFiles } from "@/db/chat";
import { OpenSidebar } from "./open-sidebar";
import { preloadedQueryResult } from "convex/nextjs";

type Props = {
  url?: string;
  chatId: Id<"chatbook">;
  isSidebarOpen: string;
  selectedFileIndex: number;
};

const CodeViewer = async ({
  url,
  chatId,
  selectedFileIndex,
  isSidebarOpen,
}: Props) => {
  const preloadedFiles = await getPreloadedGithubFiles(chatId);
  const files = preloadedQueryResult(preloadedFiles);

  const paths = files.map((file) => ({
    path: file.path,
    id: file._id,
  }));

  return (
    <div className="relative mt-16 w-full h-[calc(100%-4rem)] hidden lg:flex flex-col">
      <div className=" shadow-light border-b border-b-border p-4 flex gap-4 items-center w-full">
        <OpenSidebar />
        {files[selectedFileIndex].html_url ? (
          <Link
            target="_blank"
            className="underline transition-colors hover:text-code-foreground underline-offset-2 "
            href={files[selectedFileIndex].html_url!}
          >
            {files[selectedFileIndex]?.name}
          </Link>
        ) : (
          <p>{files[selectedFileIndex]?.name}</p>
        )}
        {isSidebarOpen === "true" && <Sidebar paths={paths} files={files} />}
      </div>
      <div className="codeblock overflow-y-auto overflow-x-auto px-2">
        <SyntaxHighlighter
          className="!mt-0"
          language={"typescript"}
          style={CodeStyle}
        >
          {files[selectedFileIndex]?.content ?? ""}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeViewer;
