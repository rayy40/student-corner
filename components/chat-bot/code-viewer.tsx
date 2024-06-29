"use client";

import type { Node } from "@/lib/types";

import { Preloaded, usePreloadedQuery } from "convex/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LuText } from "react-icons/lu";

import Loading from "@/app/loading";
import { SyntaxHighlighterWrapper } from "@/components/syntax-highlighter-wrapper";
import { api } from "@/convex/_generated/api";
import { TreeStructure } from "@/lib/types";

import Sidebar from "../sidebar";

type Props = {
  preloadedFiles: Preloaded<typeof api.chatbook.chat.getGithubFiles>;
};

export const CodeViewer = ({ preloadedFiles }: Props) => {
  const files = usePreloadedQuery(preloadedFiles);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [treeStructure, setTreeStructure] = useState<TreeStructure | undefined>(
    undefined
  );

  useMemo(() => {
    if (files?.length === 0) return;

    const paths = files?.map((file) => ({
      path: file.path,
      id: file._id,
    }));

    const updatedStructure: Node = {
      name: "root",
      metadata: { path: "", id: "" },
      children: [],
    };

    paths?.forEach((path) => {
      const segments = path.path.split("/").filter((segment) => segment !== "");
      let currentLevel: Node[] = updatedStructure.children;

      segments.forEach((segment) => {
        const existingNode = currentLevel.find((node) => node.name === segment);

        if (!existingNode) {
          const newNode = {
            name: segment,
            children: [],
            metadata: {
              path: path.path,
              id: path.id,
            },
          };
          currentLevel.push(newNode);
          currentLevel = newNode.children;
        } else {
          currentLevel = existingNode.children;
        }
      });
    });

    setTreeStructure(updatedStructure);
  }, [files]);

  if (!files) {
    return <Loading />;
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <p>No files found.</p>
      </div>
    );
  }

  return (
    <div className="relative mt-16 w-full h-[calc(100%-4rem)] flex flex-col">
      <div className=" shadow-light border-b border-b-border p-4 flex gap-4 items-center w-full">
        <LuText
          onClick={() => setIsSidebarOpen((v) => !v)}
          className="text-xl cursor-pointer z-20"
        />
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
        <Sidebar
          files={files}
          isSidebarOpen={isSidebarOpen}
          treeStructure={treeStructure}
          setIsSidebarOpen={setIsSidebarOpen}
          setSelectedFileIndex={setSelectedFileIndex}
        />
      </div>
      <div className="codeblock overflow-y-auto overflow-x-auto px-2">
        <SyntaxHighlighterWrapper>
          {files[selectedFileIndex]?.content || "No files found."}
        </SyntaxHighlighterWrapper>
      </div>
    </div>
  );
};
