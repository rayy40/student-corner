import TreeView, { INode, flattenTree } from "react-accessible-treeview";

import { Github, TreeStructure } from "@/lib/types";
import { FileIcon, FolderIcon } from "@/lib/constants";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";

type Props = {
  files: Github[];
  isSidebarOpen: boolean;
  treeStructure?: TreeStructure;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setSelectedFileIndex: (index: number) => void;
};

const Sidebar = ({
  files,
  isSidebarOpen,
  treeStructure,
  setIsSidebarOpen,
  setSelectedFileIndex,
}: Props) => {
  const handleClick = (element: INode<IFlatMetadata>) => {
    const fileIndex = files.findIndex(
      (file) => (file._id as string) === element.metadata?.id
    );

    setSelectedFileIndex(fileIndex);
    setIsSidebarOpen(false);
  };

  if (!isSidebarOpen || !treeStructure) return;

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
