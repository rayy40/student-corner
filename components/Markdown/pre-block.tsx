import React from "react";
import { CodeBlock } from "./codeblock";

interface PreBlockProps {
  children: JSX.Element | JSX.Element[];
}

export const PreBlock = ({ children, ...rest }: PreBlockProps) => {
  if ("type" in children && children["type"] === "code") {
    return CodeBlock(children["props"]);
  }
  return <pre {...rest}>{children}</pre>;
};
