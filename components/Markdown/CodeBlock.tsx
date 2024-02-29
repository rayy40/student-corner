import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight as CodeStyle } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  children: string;
  className: string;
}

const CodeBlock = ({ className, children }: CodeBlockProps) => {
  let lang = "text";
  if (className && className.startsWith("lang-")) {
    lang = className.replace("lang-", "");
  }

  return (
    <div className="w-full rounded-lg flex flex-col border border-border">
      <div className="flex gap-2 bg-code p-1 rounded-t-lg"></div>
      <div className="rounded-b-lg text-sm">
        <SyntaxHighlighter className="!mt-0" language={lang} style={CodeStyle}>
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
