import Link from "next/link";
import React, { useState } from "react";
import { LuText } from "react-icons/lu";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight as CodeStyle } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Id } from "@/convex/_generated/dataModel";
import { useQueryGithubRepoProps } from "@/hooks/useQueryObject";

import LoadingSpinner from "./LoadingSpinner";
import Sidebar from "./Sidebar";

type Props = {
  url: string;
  chatId: Id<"chatbook">;
};

const CodeViewer = ({ url, chatId }: Props) => {
  const [selectedFile, setSelectedFile] = useState(0);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const files = useQueryGithubRepoProps({ chatId });

  if (files.loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (typeof files.data === "string") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>{files.data}</p>
      </div>
    );
  }

  const paths =
    files?.data &&
    files?.data.map((file) => ({
      path: file.path,
      id: file._id,
    }));

  return (
    <div className="relative pt-[0.75rem] w-full h-full hidden lg:flex flex-col">
      <div className=" shadow-light border-b border-b-border p-4 flex gap-4 items-center w-full">
        <LuText
          onClick={() => setIsSideBarOpen((v) => !v)}
          className="text-xl cursor-pointer z-20"
        />
        {files.data?.[selectedFile].html_url ? (
          <Link
            target="_blank"
            className="underline transition-colors hover:text-code-foreground underline-offset-2 "
            href={files.data?.[selectedFile].html_url!}
          >
            {files.data?.[selectedFile]?.name}
          </Link>
        ) : (
          <p>{files.data?.[selectedFile]?.name}</p>
        )}
        {isSideBarOpen && (
          <Sidebar
            setSelectedFile={setSelectedFile}
            setIsSideBarOpen={setIsSideBarOpen}
            paths={paths!}
            files={files.data!}
          />
        )}
      </div>
      <div className="codeblock overflow-y-auto overflow-x-auto px-2">
        <SyntaxHighlighter
          className="!mt-0"
          language={"typescript"}
          style={CodeStyle}
        >
          {files?.data?.[selectedFile]?.content ?? ""}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeViewer;
