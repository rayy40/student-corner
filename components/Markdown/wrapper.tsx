import React from "react";

interface WrapperProps {
  children: JSX.Element | JSX.Element[];
}

export const Wrapper = ({ children }: WrapperProps) => {
  return <div className="wrapper">{children}</div>;
};
