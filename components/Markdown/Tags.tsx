import React from "react";

interface TagsProps {
  children: JSX.Element | JSX.Element[];
}

export const Strong = ({ children }: TagsProps) => {
  return <strong className=" text-[#303030]  font-[500]">{children}</strong>;
};

export const PrimaryHeader = ({ children }: TagsProps) => {
  return <h1 className=" font-bold text-3xl ">{children}</h1>;
};

export const SecondaryHeader = ({ children }: TagsProps) => {
  return <h2 className=" font-semibold text-2xl ">{children}</h2>;
};

export const TertiaryHeader = ({ children }: TagsProps) => {
  return <h3 className=" font-[500] text-xl ">{children}</h3>;
};

export const Header = ({ children }: TagsProps) => {
  return <h4 className=" font-[500] text-lg">{children}</h4>;
};
