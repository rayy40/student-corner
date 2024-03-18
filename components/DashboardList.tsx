import Link from "next/link";
import React from "react";
import { DashboardType } from "@/types";
import { getDate, isGameData } from "@/helpers/utils";

const DashboardList = <K extends string>({ data, type }: DashboardType<K>) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <table className="w-full border-collapse table-auto">
        <thead>
          <tr className="border-b border-b-border text-tertiary-foreground">
            <th className="pr-4 font-medium pl-2 py-2 text-left w-5">No.</th>
            <th className="px-4 font-medium py-2 text-left w-1/5">
              Created at
            </th>
            <th className="px-6 font-medium py-2 text-left w-2/5">Title</th>
            {type === "quiz" ? (
              <>
                <th className="px-4 font-medium py-2 text-center w-1/5">
                  Score
                </th>
                <th className="px-4 font-medium py-2 text-center w-1/5">
                  Correct Answers
                </th>
              </>
            ) : (
              <>
                <th className="px-4 font-medium py-2 text-left w-2/5">
                  Content
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr className="border-b border-b-border" key={item?._id}>
              <td className="text-tertiary-foreground font-medium pr-4 pl-2 py-4 w-5">
                {index + 1}.
              </td>
              <td className="px-4 py-4 w-1/5">
                {getDate(item?._creationTime)}
              </td>
              <td className="px-6 py-4 w-2/5">
                <Link
                  className="hover:underline"
                  href={`/${type}/${item?._id ?? ""}`}
                >
                  {item.title}
                </Link>
              </td>
              {isGameData(item) ? (
                <>
                  <td className="text-center px-4 py-4 w-1/5">
                    {item?.result?.score ?? "-"}
                  </td>
                  <td className="text-center px-4 py-4 w-1/5">
                    {item?.result?.correctAnswer ?? "-"}
                  </td>
                </>
              ) : (
                <td className="px-4 py-4 w-2/5">
                  <Link
                    target="_blank"
                    className="text-secondary-foreground hover:text-foreground hover:underline transition-all"
                    href={item?.url}
                  >
                    {item?.url}
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardList;
