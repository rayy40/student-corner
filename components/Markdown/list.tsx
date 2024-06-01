import React from "react";

interface ListProps {
  children: JSX.Element | JSX.Element[];
}

export const ListItem = ({ children }: ListProps) => {
  return <>{children}</>;
};

export const OrderedList = ({ children }: ListProps) => {
  return (
    <ol className="mb-6 space-y-2 pl-4 list-decimal">
      {Array.isArray(children) ? (
        children.map((child, index) => <li key={index}>{child}</li>)
      ) : (
        <li>{children}</li>
      )}
    </ol>
  );
};

export const UnorderedList = ({ children }: ListProps) => {
  return (
    <ul className="mb-6 space-y-2 pl-4 list-disc">
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <li className="max-w-[98%] w-full" key={index}>
            {child}
          </li>
        ))
      ) : (
        <li className="max-w-[98%] w-full">{children}</li>
      )}
    </ul>
  );
};
