import React from "react";

interface TableProps {
  children: JSX.Element | JSX.Element[];
}

const Table = ({ children }: TableProps) => {
  const TableData = ({ child }: { child: JSX.Element }) => {
    return <td className="flex-1 p-3">{child["props"]?.["children"]}</td>;
  };
  const TableHead = ({ child }: { child: JSX.Element }) => {
    return (
      <th className="flex-1 font-medium p-3 capitalize ">
        {child["props"]?.["children"]}
      </th>
    );
  };

  const TableRow = ({
    child,
    type,
  }: {
    child: JSX.Element | JSX.Element[];
    type: "head" | "body";
  }) => {
    return (
      <tr className="divide-x divide-[hsl(0_0_84%)] flex justify-start items-start">
        {type === "head" ? (
          Array.isArray(child) ? (
            child.map((item, index) => (
              <TableHead key={`table-head-${index}`} child={item} />
            ))
          ) : (
            <TableHead child={child} />
          )
        ) : Array.isArray(child) ? (
          child.map((item, index) => (
            <TableData key={`table-body-${index}`} child={item} />
          ))
        ) : (
          <TableData child={child} />
        )}
      </tr>
    );
  };

  const TableHeader = ({ child }: { child: JSX.Element | JSX.Element[] }) => {
    return (
      <thead className=" border-b border-b-[hsl(0_0_84%)] bg-[hsl(0_0_88%)] text-secondary-foreground">
        {Array.isArray(child) ? (
          child.map((item, index) => (
            <TableRow
              child={item["props"]?.["children"]}
              type={"head"}
              key={`head-${index}`}
            />
          ))
        ) : (
          <TableRow child={child["props"]?.["children"]} type={"head"} />
        )}
      </thead>
    );
  };

  const TableBody = ({ child }: { child: JSX.Element | JSX.Element[] }) => {
    return (
      <tbody className="divide-y divide-[hsl(0_0_84%)]">
        {Array.isArray(child) ? (
          child.map((item, index) => (
            <TableRow
              child={item["props"]?.["children"]}
              type={"body"}
              key={`body-${index}`}
            />
          ))
        ) : (
          <TableRow child={child["props"]?.["children"]} type={"body"} />
        )}
      </tbody>
    );
  };

  return (
    <table className="border border-[hsl(0_0_84%)] rounded-lg">
      {Array.isArray(children) &&
        children.map((item, index) => {
          if (item.type === "thead") {
            return (
              <TableHeader key={index} child={item["props"]?.["children"]} />
            );
          } else if (item.type === "tbody") {
            return (
              <TableBody key={index} child={item["props"]?.["children"]} />
            );
          }
          return null;
        })}
    </table>
  );
};

export default Table;
