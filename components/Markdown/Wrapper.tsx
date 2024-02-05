import React from "react";

interface WrapperProps {
  children: JSX.Element | JSX.Element[];
}

const Wrapper = ({ children }: WrapperProps) => {
  return <div className="flex flex-col gap-4 p-3 pr-4">{children}</div>;
};

export default Wrapper;
