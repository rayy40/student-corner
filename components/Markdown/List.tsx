import React from "react";

interface ListProps {
  children: JSX.Element | JSX.Element[];
}

export const ListItem = ({ children }: ListProps) => {
  return <>{children}</>;
};

export const OrderedList = ({ children }: ListProps) => {
  return (
    <ol className="leading-6 py-3 pl-4 list-decimal">
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <li className="leading-6 my-3 first:mt-0" key={index}>
            {child}
          </li>
        ))
      ) : (
        <li className="leading-6 flex my-2">{children}</li>
      )}
    </ol>
  );
};

export const UnorderedList = ({ children }: ListProps) => {
  return (
    <ul className="leading-6 py-3 pl-4 list-disc">
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <li className="leading-6 my-3 first:mt-0" key={index}>
            {child}
          </li>
        ))
      ) : (
        <li className="leading-6 flex my-2">{children}</li>
      )}
    </ul>
  );
};
