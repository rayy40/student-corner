"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import TreeView, { flattenTree, INode } from "react-accessible-treeview";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";
import {
  DiCss3,
  DiHtml5,
  DiJavascript1,
  DiMarkdown,
  DiPython,
  DiReact,
  DiSass,
} from "react-icons/di";
import { LuFile, LuFolder, LuFolderOpen } from "react-icons/lu";
import { SiGit } from "react-icons/si";
import { TbBrandTypescript } from "react-icons/tb";
import { VscJson } from "react-icons/vsc";

import { Github, Node, TreeStructure } from "@/lib/types";

type Props = {
  paths: {
    path: string;
    id: string;
  }[];
  files: Github[];
};

const Sidebar = ({ paths, files }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [treeStructure, setTreeStructure] = useState<TreeStructure>();

  useMemo(() => {
    const updatedStructure: Node = {
      name: "root",
      metadata: { path: "", id: "" },
      children: [],
    };

    paths.forEach((path) => {
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
  }, [paths]);

  if (!treeStructure) return null;

  const FileIcon = ({ fileName }: { fileName: string }) => {
    const extension = fileName.slice(fileName.lastIndexOf(".") + 1);
    switch (extension) {
      case "js":
        return <DiJavascript1 />;
      case "css":
        return <DiCss3 />;
      case "json":
        return <VscJson />;
      case "scss":
        return <DiSass />;
      case "html":
        return <DiHtml5 />;
      case "py":
        return <DiPython />;
      case "ts":
        return <TbBrandTypescript />;
      case "tsx":
        return <TbBrandTypescript />;
      case "jsx":
        return <DiReact />;
      case "md":
        return <DiMarkdown />;
      case "gitignore":
        return <SiGit />;
      default:
        return <LuFile />;
    }
  };

  const FolderIcon = ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <LuFolderOpen /> : <LuFolder />;

  const handleClick = (element: INode<IFlatMetadata>) => {
    const fileIndex = files.findIndex(
      (file) => (file._id as string) === element.metadata?.id
    );

    const current = new URLSearchParams(searchParams);

    current.set("index", fileIndex.toString());
    current.set("sidebar", "false");

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };

  return (
    <div className="absolute overflow-y-auto shadow-light left-0 top-0 h-full w-[300px] z-10 border bg-white">
      <div className="sticky top-0 z-20 p-4 pl-12 bg-white border-b border-b-border">
        SideBar
      </div>
      <TreeView
        data={flattenTree(treeStructure)}
        className="basic"
        togglableSelect
        clickAction="EXCLUSIVE_SELECT"
        multiSelect
        nodeRenderer={({
          element,
          isBranch,
          isExpanded,
          getNodeProps,
          level,
        }) => (
          <div {...getNodeProps()}>
            <div
              onClick={() => (!isBranch ? handleClick(element) : null)}
              style={{ paddingLeft: 16 + 20 * (level - 1) }}
              className="flex items-center w-full gap-4 py-2 pr-4"
            >
              <span className="w-4">
                {isBranch ? (
                  <FolderIcon isOpen={isExpanded} />
                ) : (
                  <FileIcon fileName={element.name} />
                )}
              </span>
              <p className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[90%] ">
                {element.name}
              </p>
            </div>
          </div>
        )}
      ></TreeView>
    </div>
  );
};

export default Sidebar;
