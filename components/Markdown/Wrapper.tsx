import React from "react";

interface WrapperProps {
  children: JSX.Element | JSX.Element[];
}

const Wrapper = ({ children }: WrapperProps) => {
  return <div className="wrapper leading-7 p-3 pr-4">{children}</div>;
};

export default Wrapper;
