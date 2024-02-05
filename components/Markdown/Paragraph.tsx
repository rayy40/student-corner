import React from "react";

interface ParagraphProps {
  children: JSX.Element | JSX.Element[];
}

const Paragraph = ({ children }: ParagraphProps) => {
  return <p className="my-2 text-[1rem] first:mt-0 last:mb-0">{children}</p>;
};

export default Paragraph;
