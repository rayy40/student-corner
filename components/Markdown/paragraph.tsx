import React from "react";

interface ParagraphProps {
  children: JSX.Element | JSX.Element[];
}

export const Paragraph = ({ children }: ParagraphProps) => {
  return (
    <p className="text-[1rem] max-w-[98%] w-full mb-4 last:mb-0">{children}</p>
  );
};
