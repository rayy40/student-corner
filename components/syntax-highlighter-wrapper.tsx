import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight as CodeStyle } from "react-syntax-highlighter/dist/esm/styles/prism";

export const SyntaxHighlighterWrapper = ({
  children,
}: {
  children: string;
}) => {
  console.log("first");
  return (
    <div className="syntax-highlighter-wrapper">
      <SyntaxHighlighter
        className="!mt-0"
        style={CodeStyle}
        language="typescript"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};
