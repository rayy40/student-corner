import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { LuFolder, LuFolderOpen, LuFile } from "react-icons/lu";
import { GithubFilesData, Node, TreeStructure } from "@/types";
import TreeView, { INode, flattenTree } from "react-accessible-treeview";
import {
  DiCss3,
  DiJavascript1,
  DiPython,
  DiHtml5,
  DiSass,
  DiReact,
  DiMarkdown,
} from "react-icons/di";
import { SiGit } from "react-icons/si";
import { VscJson } from "react-icons/vsc";
import { TbBrandTypescript } from "react-icons/tb";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";

type Props = {
  paths: {
    path: string;
    id: string;
  }[];
  files: GithubFilesData[];
  setIsSideBarOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedFile: Dispatch<SetStateAction<number>>;
};

const Sidebar = ({
  paths,
  setIsSideBarOpen,
  setSelectedFile,
  files,
}: Props) => {
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
    setSelectedFile(fileIndex);
    setIsSideBarOpen(false);
  };

  return (
    <div className="absolute overflow-y-auto shadow-light top-[0.7rem] left-0 h-[calc(100%-0.7rem)] w-[300px] z-10 border bg-white">
      <div className="p-4 sticky top-0 z-20 bg-white border-b border-b-border pl-12">
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
              className="flex gap-4 py-2 pr-4 items-center w-full"
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
