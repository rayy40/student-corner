export const quizes = ["topic", "paragraph", "files"];

export const chatbooks = ["youtube", "files", "docs", "github"];

export const formats = ["mcq", "name the following", "true/false"];

import { LuFile, LuFolder, LuFolderOpen } from "react-icons/lu";
import {
  DiCss3,
  DiHtml5,
  DiJavascript1,
  DiMarkdown,
  DiPython,
  DiReact,
  DiSass,
} from "react-icons/di";
import { SiGit } from "react-icons/si";
import { TbBrandTypescript } from "react-icons/tb";
import { VscJson } from "react-icons/vsc";

export const FileIcon = ({ fileName }: { fileName: string }) => {
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

export const FolderIcon = ({ isOpen }: { isOpen: boolean }) =>
  isOpen ? <LuFolderOpen /> : <LuFolder />;
