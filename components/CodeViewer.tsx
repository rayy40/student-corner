import { Id } from "@/convex/_generated/dataModel";
import { useQueryGithubFileProps } from "@/hooks/useQueryObject";
import { LuText } from "react-icons/lu";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight as CodeStyle } from "react-syntax-highlighter/dist/esm/styles/prism";
import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import Link from "next/link";

type Props = {
  url: string;
  chatId: Id<"chatbook">;
};

const CodeViewer = ({ url, chatId }: Props) => {
  const [selectedFile, setSelectedFile] = useState(0);
  const data = useQueryGithubFileProps({
    chatId,
  });

  if (data.loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  console.log(data);
  return (
    <div className="pt-[0.75rem] w-full h-full flex flex-col">
      <div className="shadow-light border-b border-b-border p-4 flex gap-4 items-center w-full">
        <LuText className="text-xl cursor-pointer" />
        {data?.data?.[selectedFile]?.url ? (
          <Link
            target="_blank"
            className="underline transition-colors hover:text-code-foreground underline-offset-2 "
            href={data?.data?.[selectedFile]?.url}
          >
            {data?.data?.[selectedFile]?.name}
          </Link>
        ) : (
          <p>{data?.data?.[selectedFile]?.name}</p>
        )}
      </div>
      <div className="codeblock overflow-y-auto overflow-x-auto px-2">
        <SyntaxHighlighter
          className="!mt-0"
          language={"typescript"}
          style={CodeStyle}
        >
          {data?.data?.[selectedFile]?.content ?? ""}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeViewer;
