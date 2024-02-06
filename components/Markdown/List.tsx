import React from "react";

interface ListProps {
  children: JSX.Element | JSX.Element[];
}

export const ListItem = ({ children }: ListProps) => {
  return <>{children}</>;
};

export const List = ({ children }: ListProps) => {
  return (
    <ol className="leading-6 py-3 pl-4 list-decimal">
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <li className="my-3 first:mt-0" key={index}>
            {child}
          </li>
        ))
      ) : (
        <li className="flex my-2">{children}</li>
      )}
    </ol>
  );
};
